"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { address } = useAccount();

  const { data: owner } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "owner",
  });

  const { data: coordinator } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "coordinator",
  });

  const { data: contributor } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "contributors",
    args: [address],
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();
  const isCoordinator = address && coordinator && address.toLowerCase() === coordinator.toLowerCase();
  const isAdmin = isOwner || isCoordinator;
  const isRegistered = contributor && contributor[0] === true;

  const menuLinks: HeaderMenuLink[] = [
    {
      label: "Home",
      href: "/",
    },
  ];

  if (address && !isRegistered) {
    menuLinks.push({
      label: "Register",
      href: "/register",
    });
  }

  if (isRegistered) {
    menuLinks.push(
      {
        label: "Verify",
        href: "/verify",
      }
    );
  }

  menuLinks.push(
    {
      label: "Submissions",
      href: "/submissions",
    },
    {
      label: "Verify",
      href: "/verify",
    }
  );

  if (isAdmin) {
    menuLinks.push({
      label: "Admin Panel",
      href: "/admin",
    });
  }

  menuLinks.push({
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  });

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-[#800020] text-white shadow-md" : ""
              } hover:bg-[#800020] hover:text-white hover:shadow-md focus:!bg-[#800020] focus:!text-white active:!text-white py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-[#800020] min-h-0 shrink-0 justify-between z-20 shadow-md shadow-[#600018] px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-[#600018] text-white">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight text-white">Scaffold-ETH</span>
            <span className="text-xs text-white/80">Ethereum dev stack</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4">
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
