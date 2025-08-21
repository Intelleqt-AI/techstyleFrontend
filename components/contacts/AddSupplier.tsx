import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { addNewContact } from "@/supabase/API";
import { toast } from "sonner";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomDropdown from "./CustomDropdown";
import { Textarea } from "../ui/textarea";

const initialValue = {
  name: "",
  company: "",
  email: "",
  type: "Supplier",
  connection: "",
  find: "",
  budget: 0,
  project: "",
  status: "",
  phone: "",
  surname: "",
  address: "",
};

const AddSupplier = ({ refetchSupplier }) => {
  const [defaultValue, setDefaultValue] = useState(initialValue);
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: addNewContact,
    onSuccess: () => {
      toast("Supplier Added!");
      refetchSupplier();
      setOpen(false);
    },
    onError: () => {
      toast("Error! Try again");
    },
  });

  const updateTask = React.useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | { target: { name: string; value: string } }
    ) => {
      const { name, value } = e.target;
      setDefaultValue((prevTask) => ({
        ...prevTask,
        [name]: value,
      }));
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (defaultValue.name.length < 2) {
      toast.error("First Name Required");
      return;
    }
    if (defaultValue.company.length < 1) {
      toast.error("Company Required");
      return;
    }
    mutation.mutate(defaultValue);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm w-full  border-t px-2 py-2 text-center">
          Add Supplier
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Supplier</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 ">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.name}
                className="bg-white rounded-lg"
                id="name"
                name="name"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Surname</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.surname}
                className="bg-white rounded-lg"
                id="surname"
                name="surname"
                placeholder="Johh"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.email}
                className="bg-white rounded-lg"
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.phone}
                className="bg-white rounded-lg"
                id="phone"
                name="phone"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className={`space-y-2 col-span-2`}>
              <Label htmlFor="status">Status</Label>
              <CustomDropdown
                value={defaultValue.status}
                onChange={(value) => {
                  updateTask({
                    target: {
                      name: "status",
                      value: value,
                    },
                  });
                }}
                placeholder="Select Status"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="company">Company</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.company}
                className="bg-white rounded-lg"
                id="company"
                name="company"
                placeholder="Company Name"
                required
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="budget">Address</Label>
            <Textarea
              onChange={updateTask}
              value={defaultValue?.address}
              className="bg-white rounded-lg"
              id="address"
              name="address"
              placeholder="e.g. Street	53060 N Carolina 12
"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmit}>Add</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplier;
