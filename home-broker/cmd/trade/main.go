package main

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"

	"github.com/Emanuelpna/home-broker/internal/market/dto"
	"github.com/Emanuelpna/home-broker/internal/market/entity"
	"github.com/Emanuelpna/home-broker/internal/market/infra/kafka"
	"github.com/Emanuelpna/home-broker/internal/market/transformer"
	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	ordersInput := make(chan *entity.Order)
	ordersOutput := make(chan *entity.Order)

	waitGroup := &sync.WaitGroup{}

	defer waitGroup.Wait()

	kafkaMessageChannel := make(chan *ckafka.Message)

	configMap := &ckafka.ConfigMap{
		"bootstrap.servers": os.Getenv("KAFKA_HOST"),
		"group.id":          os.Getenv("KAFKA_GROUP"),
		"auto.offset.reset": "earliest",
	}

	producer := kafka.NewKafkaProducer(configMap)

	kafkaClient := kafka.NewConsumer(configMap, []string{"input"})

	go kafkaClient.Consume(kafkaMessageChannel) // Run in different Thread

	book := entity.NewBook(ordersInput, ordersOutput, waitGroup)

	go book.Trade() // Run in different Thread

	go func() {
		for message := range kafkaMessageChannel {
			waitGroup.Add(1)

			fmt.Println(string(message.Value))

			tradeInput := dto.TradeInput{}

			err := json.Unmarshal(message.Value, &tradeInput)
			if err != nil {
				panic(err)
			}

			order := transformer.TransformInput(tradeInput)
			ordersInput <- order
		}
	}() // Run in different Thread

	for result := range ordersOutput {
		output := transformer.TransformOutput(result)

		outputJson, err := json.MarshalIndent(output, "", "   ")

		fmt.Println(string(outputJson))

		if err != nil {
			fmt.Println(err)
		}

		producer.Publish(outputJson, []byte("orders"), "output")
	}
}
