package entity

import (
	"container/heap"
	"sync"
)

type Book struct {
	Orders              []*Order
	Transactions        []*Transaction
	OrdersChannelInput  chan *Order
	OrdersChannelOutput chan *Order
	WaitGroup           *sync.WaitGroup
}

func NewBook(ordersChannelInput chan *Order, ordersChannelOutput chan *Order, waitGroup *sync.WaitGroup) *Book {
	return &Book{
		Orders:              []*Order{},
		Transactions:        []*Transaction{},
		OrdersChannelInput:  ordersChannelInput,
		OrdersChannelOutput: ordersChannelOutput,
		WaitGroup:           waitGroup,
	}
}

func (b *Book) Trade() {
	buyOrders := make(map[string]*OrderQueue)
	sellOrders := make(map[string]*OrderQueue)

	for order := range b.OrdersChannelInput {
		asset := order.Asset.ID

		if buyOrders[asset] == nil {
			buyOrders[asset] = NewOrderQueue()
			heap.Init(buyOrders[asset])
		}

		if sellOrders[asset] == nil {
			sellOrders[asset] = NewOrderQueue()
			heap.Init(sellOrders[asset])
		}

		buyOrderAsset := buyOrders[asset]
		sellOrderAsset := sellOrders[asset]

		// É um pedido de COMPRA de ação
		if order.OrderType == "BUY" {
			buyOrderAsset.Push(order)

			// Existem pedidos de VENDA e tem o mesmo preço que o pedido de COMPRA
			if sellOrderAsset.Len() > 0 && sellOrderAsset.Orders[0].Price <= order.Price {
				sellOrder := sellOrderAsset.Pop().(*Order)

				// Existem cotas sobrando para serem transacionadas
				if sellOrder.PendingShares > 0 {
					transaction := NewTransaction(sellOrder, order, order.Shares, sellOrder.Price)
					b.AddTransaction(transaction, b.WaitGroup)

					sellOrder.Transactions = append(sellOrder.Transactions, transaction)
					order.Transactions = append(order.Transactions, transaction)

					// Envia os pedidos para o Canal de Output
					b.OrdersChannelOutput <- sellOrder
					b.OrdersChannelOutput <- order

					if sellOrder.PendingShares > 0 {
						sellOrderAsset.Push(sellOrder)
					}
				}
			}
		} else if order.OrderType == "SELL" {
			sellOrderAsset.Push(order)

			// Existem pedidos de VENDA e tem o mesmo preço que o pedido de COMPRA
			if buyOrderAsset.Len() > 0 && buyOrderAsset.Orders[0].Price >= order.Price {
				buyOrder := buyOrderAsset.Pop().(*Order)

				// Existem cotas sobrando para serem transacionadas
				if buyOrder.PendingShares > 0 {
					transaction := NewTransaction(order, buyOrder, order.Shares, buyOrder.Price)
					b.AddTransaction(transaction, b.WaitGroup)

					buyOrder.Transactions = append(buyOrder.Transactions, transaction)
					order.Transactions = append(order.Transactions, transaction)

					// Envia os pedidos para o Canal de Output
					b.OrdersChannelOutput <- buyOrder
					b.OrdersChannelOutput <- order

					// Manda de volta pra fila se ainda continua tem cotas sobrando
					if buyOrder.PendingShares > 0 {
						buyOrderAsset.Push(buyOrder)
					}
				}
			}
		}
	}
}

func (b *Book) AddTransaction(transaction *Transaction, waitGroup *sync.WaitGroup) {
	defer waitGroup.Done()

	sellingShares := transaction.SellingOrder.PendingShares
	buyingShares := transaction.BuyingOrder.PendingShares

	minShares := sellingShares
	if buyingShares < minShares {
		minShares = buyingShares
	}

	transaction.SellingOrder.Investor.UpdateAssetPosition(transaction.SellingOrder.Asset.ID, -minShares)
	transaction.AddBuyingOrderPendingShares(-minShares)

	transaction.BuyingOrder.Investor.UpdateAssetPosition(transaction.BuyingOrder.Asset.ID, minShares)
	transaction.AddSellingOrderPendingShares(-minShares)

	transaction.CalculateTotal(transaction.Shares, transaction.BuyingOrder.Price)

	transaction.CloseBuyingOrder()
	transaction.CloseSellingOrder()

	b.Transactions = append(b.Transactions, transaction)
}
