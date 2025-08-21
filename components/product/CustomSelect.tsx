import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CustomSelect = ({ product, updateProduct }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(product?.type || "");
  const [customOptions, setCustomOptions] = useState([]);
  const [newOption, setNewOption] = useState("");

  // Predefined options
  const defaultOptions = ["Bookcase", "Shelves", "Lighting", "Wall decor"];

  // Combined options (predefined + custom)
  const allOptions = [...defaultOptions, ...customOptions];

  const handleSelectChange = (currentValue) => {
    setValue(currentValue);
    const e = {
      target: {
        name: "type",
        value: currentValue,
      },
    };
    updateProduct(e);
    setOpen(false);
  };

  const handleAddOption = () => {
    if (newOption && !allOptions.includes(newOption)) {
      setCustomOptions([...customOptions, newOption]);
      setNewOption("");
      handleSelectChange(newOption);
    }
  };

  return (
    <div className="space-y-2 col-span-2 mt-3">
      <Label htmlFor="type">Type</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="bg-white rounded-[10px] w-full px-3 py-[10px] border justify-between">
            {value ? value : "Select type"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white z-[999]">
          <Command>
            <CommandInput placeholder="Search type..." />
            <CommandList>
              <CommandEmpty>
                <p className="py-2 px-4 text-sm">No type found.</p>
              </CommandEmpty>
              {allOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelectChange(option)}
                  className="flex items-center cursor-pointer">
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                  {customOptions.includes(option) && (
                    <span className="ml-auto text-xs text-gray-400">
                      (custom)
                    </span>
                  )}
                </CommandItem>
              ))}
              <div className="flex items-center border-t px-3 py-2">
                <Input
                  placeholder="Add custom type..."
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="flex-1 h-8 border"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 ml-2"
                  onClick={handleAddOption}
                  disabled={!newOption || allOptions.includes(newOption)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CustomSelect;
