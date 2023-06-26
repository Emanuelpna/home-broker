"use client";

import { Navbar as FlowbiteNavbar } from "flowbite-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";

export default function Navbar() {
  const params = useParams();
  const pathname = usePathname();

  return (
    <FlowbiteNavbar fluid rounded>
      <FlowbiteNavbar.Brand href="https://flowbite-react.com">
        <Image
          className="mr-3 h-6 sm:h-9 object-contain"
          alt="Full Cycle Invest"
          src="/logo.png"
          width={37}
          height={40}
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          FullCycle Invest
        </span>
      </FlowbiteNavbar.Brand>
      <FlowbiteNavbar.Toggle />
      <FlowbiteNavbar.Collapse>
        <FlowbiteNavbar.Link
          active={pathname === `/${params.wallet_id}`}
          as={Link}
          href={`/${params.wallet_id}`}
        >
          Home
        </FlowbiteNavbar.Link>
        <FlowbiteNavbar.Link href="#">Ativos</FlowbiteNavbar.Link>
      </FlowbiteNavbar.Collapse>
      <div className="flex md:order-2 text-white">Olá {params.wallet_id}</div>
    </FlowbiteNavbar>
  );
}
