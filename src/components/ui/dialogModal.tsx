import React from 'react';
import { Input } from './ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import Image from 'next/image';

function DialogModal({
  coinData,
  handleNetworkRender,
  handleTokenSelection2,
  value,
  handleNetworkset,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="w-full max-w-[664px] max-h-[595px] bg-[#18181B] rounded-lg flex flex-col gap-6 p-6">
        <div className="flex flex-col items-center text-start">
          <span className="text-2xl text-white font-bold mb-4 ">Networks</span>
          <div className="w-full">
            <Input
              placeholder="Search"
              className="w-full h-10 px-4 rounded-lg bg-[#27272A] text-white"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <Accordion
            type="single"
            collapsible
            className="w-full text-md no-scrollbar bg-[#27272A] rounded-md relative"
          >
            {coinData?.map((coin) => (
              <AccordionItem key={coin?.id} value={coin?.id} className="border-b-0">
                <AccordionTrigger
                  onClick={() => handleNetworkRender(coin?.name, 'to')}
                  className="flex items-center px-4 py-2 bg-[#18181B] text-white"
                >
                  <Image src={coin?.logoURI} alt={coin?.name} width={48} height={48} className="rounded-full" />
                  <h1 className="ml-4">{coin?.name}</h1>
                </AccordionTrigger>
                <AccordionContent className="text-start list-none h-32 overflow-y-auto  bg-dark/70 px-4 ml-0 no-scrollbar border-2xl">
                  {value?.map((network, index) => (
                    <div
                      key={index}
                      className="flex items-center px-2 my-1  cursor-pointer"
                      onClick={() => handleNetworkset(network?.name, network, network?.image)}
                      style={{borderRadius:"35px"}}
                    >
                      <Image src={network?.image} width={30} height={30} alt="values" className="rounded-full mr-4" />
                      <div className="flex flex-col">
                        <span className="text-neutral-400">{coin?.name}</span>
                        <span className="text-md">{network?.symbol}</span>
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default DialogModal;
