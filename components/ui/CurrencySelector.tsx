import React, { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Currency data
const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", value: "USD" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", value: "EUR" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", value: "GBP" },
  {
    code: "BDT",
    symbol: "৳",
    name: "Bangladeshi Taka",
    flag: "🇧🇩",
    value: "BDT",
  },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", value: "JPY" },
  {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    value: "CAD",
  },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    value: "AUD",
  },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭", value: "CHF" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳", value: "CNY" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", value: "INR" },
  {
    code: "KRW",
    symbol: "₩",
    name: "South Korean Won",
    flag: "🇰🇷",
    value: "KRW",
  },
  {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    flag: "🇸🇬",
    value: "SGD",
  },
  {
    code: "SEK",
    symbol: "kr",
    name: "Swedish Krona",
    flag: "🇸🇪",
    value: "SEK",
  },
  {
    code: "NOK",
    symbol: "kr",
    name: "Norwegian Krone",
    flag: "🇳🇴",
    value: "NOK",
  },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰", value: "DKK" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty", flag: "🇵🇱", value: "PLN" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿", value: "CZK" },
  {
    code: "HUF",
    symbol: "Ft",
    name: "Hungarian Forint",
    flag: "🇭🇺",
    value: "HUF",
  },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺", value: "RUB" },
  {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    flag: "🇧🇷",
    value: "BRL",
  },
  { code: "MXN", symbol: "$", name: "Mexican Peso", flag: "🇲🇽", value: "MXN" },
  {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    flag: "🇿🇦",
    value: "ZAR",
  },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷", value: "TRY" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪", value: "AED" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦", value: "SAR" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭", value: "THB" },
  {
    code: "MYR",
    symbol: "RM",
    name: "Malaysian Ringgit",
    flag: "🇲🇾",
    value: "MYR",
  },
  {
    code: "IDR",
    symbol: "Rp",
    name: "Indonesian Rupiah",
    flag: "🇮🇩",
    value: "IDR",
  },
  {
    code: "PHP",
    symbol: "₱",
    name: "Philippine Peso",
    flag: "🇵🇭",
    value: "PHP",
  },
  {
    code: "VND",
    symbol: "₫",
    name: "Vietnamese Dong",
    flag: "🇻🇳",
    value: "VND",
  },
  {
    code: "PKR",
    symbol: "₨",
    name: "Pakistani Rupee",
    flag: "🇵🇰",
    value: "PKR",
  },
  {
    code: "LKR",
    symbol: "₨",
    name: "Sri Lankan Rupee",
    flag: "🇱🇰",
    value: "LKR",
  },
  {
    code: "NPR",
    symbol: "₨",
    name: "Nepalese Rupee",
    flag: "🇳🇵",
    value: "NPR",
  },
  {
    code: "EGP",
    symbol: "£",
    name: "Egyptian Pound",
    flag: "🇪🇬",
    value: "EGP",
  },
  {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    flag: "🇳🇬",
    value: "NGN",
  },
  {
    code: "KES",
    symbol: "KSh",
    name: "Kenyan Shilling",
    flag: "🇰🇪",
    value: "KES",
  },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", flag: "🇬🇭", value: "GHS" },
];

export const CurrencySelector = ({ value, onChange, data }) => {
  const [open, setOpen] = useState(false);

  const currentValue = value || data?.currency || "";

  const handleValueChange = (newValue) => {
    if (onChange) {
      // Call updateData directly with the currency update
      onChange({ currency: newValue });
    }
    setOpen(false);
  };

  const selectedCurrency = currencies.find(
    (c) => c.value === currentValue.value
  );
  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className=" h-auto font-medium text-[#17181B] border outline-none rounded-xl py-2.5 px-4 w-full flex text-sm justify-between bg-white hover:bg-white">
            {selectedCurrency ? (
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedCurrency.flag}</span>
                <span className="font-medium">{selectedCurrency.code}</span>
                <span className="text-gray-600">
                  ({selectedCurrency.symbol})
                </span>
              </div>
            ) : (
              <span className="text-gray-400">Select Currency</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0 bg-white" align="start">
          <Command>
            <CommandInput placeholder="Search currencies..." className="h-9" />
            <CommandList>
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup>
                {currencies.map((currency) => (
                  <CommandItem
                    key={currency.value}
                    value={`${currency.name} ${currency.symbol}`}
                    onSelect={() => handleValueChange(currency)}
                    className="cursor-pointer">
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-base">{currency.flag}</span>
                      <span className="font-medium min-w-12">
                        {currency.code}
                      </span>
                      <span className="text-gray-600 min-w-8">
                        ({currency.symbol})
                      </span>
                      <span className="text-gray-500 text-sm flex-1 text-left">
                        {currency.name}
                      </span>
                    </div>
                    <Check
                      className={`ml-auto h-4 w-4 ${
                        currentValue === currency.value
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
