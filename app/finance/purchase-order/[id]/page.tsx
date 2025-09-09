'use client';
import { useEffect, useState } from 'react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import souqLogo from '/public/studio.jpeg';
import errorImage from '/public/product-placeholder-wp.jpg';
import { getPurchaseOrder, updatePurchaseOrder } from '@/supabase/API';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

export default function NewPurchaseOrderForm({ params }) {
  const [defaultValue, setDefaultValue] = useState<any>(null);
  const id = params?.id;
  const form2 = useForm({});
  const form = useForm({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pruchaseOrder'],
    queryFn: getPurchaseOrder,
  });

  const handleBack = () => {
    // navigate(-1);
  };

  // update PO
  const mutation = useMutation({
    mutationFn: updatePurchaseOrder,
    onSuccess: () => {
      refetch();
      toast('PO Updated');
      // navigate(-1);
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Set order info
  useEffect(() => {
    if (isLoading) return;
    setDefaultValue(data?.data.find(item => item.id === id));
  }, [id, isLoading, data?.data]);

  const updateClientInfo = e => {
    const { name, value } = e.target;
    setDefaultValue(prevTask => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const updateInfo = (e, itemID) => {
    const { name, value } = e.target;
    setDefaultValue(prev => ({
      ...prev,
      products: prev.products.map(item => (item.itemID === itemID ? { ...item, [name]: value } : item)),
    }));
  };
  const handleDueDateChange = (date: Date | undefined) => {
    if (!date) {
      form2.reset({ dueDate: undefined });
      setDefaultValue(prev => ({ ...prev, dueDate: '' }));
      return;
    }
    const parseDate = date.toISOString();
    form2.setValue('dueDate', date);
    setDefaultValue(prev => ({
      ...prev,
      dueDate: parseDate,
    }));
  };

  const handleIssueDateChange = (date: Date | undefined) => {
    if (!date) {
      form.reset({ issueDate: undefined });
      setDefaultValue(prev => ({ ...prev, issueDate: '' }));
      return;
    }
    const parseDate = date.toISOString();
    form.setValue('issueDate', date);
    setDefaultValue(prev => ({
      ...prev,
      issueDate: parseDate,
    }));
  };

  useEffect(() => {
    if (defaultValue) {
      const initializeDates = () => {
        // set due date
        if (defaultValue.dueDate) {
          const dueDate = new Date(defaultValue.dueDate);
          form2.setValue('dueDate', dueDate);
          // set issue date
        }
        if (defaultValue.issueDate) {
          const issueDate = new Date(defaultValue.issueDate);
          form.setValue('issueDate', issueDate);
        }
      };
      initializeDates();
    } else {
      form2.reset({ dueDate: undefined });
      form.reset({ issueDate: undefined });
    }
  }, [defaultValue]);

  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate({ order: defaultValue });
  };

  const subTotalNum =
    defaultValue?.products?.reduce((total, product) => {
      const amount = parseFloat(product.amount.replace(/[^0-9.-]+/g, ''));
      return total + amount * product.QTY;
    }, 0) || 0;

  const subTotalWithDeliveryNum = subTotalNum + Number(defaultValue?.delivery_charge);
  const subTotalWithDelivery = subTotalWithDeliveryNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const taxNum = subTotalNum * 0.15;
  const totalWithTaxNum = subTotalNum + taxNum;

  const subTotal = subTotalNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const tax = taxNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const totalWithTax = totalWithTaxNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Set order info
  useEffect(() => {
    if (isLoading) return;
    setDefaultValue(data?.data.find(item => String(item.id) == String(id)));
  }, [id, data?.data, isLoading]);

  useEffect(() => {
    console.log('API raw data:', data?.data);
    console.log('Matched order:', defaultValue);
  }, [id, data?.data, isLoading]);

  return (
    <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto py-10">
      {/* <ScrollArea className="h-[calc(100vh-16rem)] px-1"> */}
      <div className="space-y-8 pb-8">
        {/* Heading */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[#091E42] font-semibold mb-1 text-2xl">Purchase Order</h1>
            <h4 className="text-[20px]">#{defaultValue?.poNumber}</h4>
            <div className="my-8 text-[14px] leading-[180%]">
              {/* <p className="mb-1 font-semibold">Supplier</p> */}
              Issue Date : {new Date(defaultValue?.issueDate).toLocaleDateString('en-GB')}
              <br />
              Due Date : {defaultValue?.dueDate ? new Date(defaultValue.dueDate).toLocaleDateString('en-GB') : '-'}
              <br />
              Supplier : {defaultValue?.supplier?.company} <br />
              <br />
              Project : {defaultValue?.projectName}
              {/* Name : {defaultValue.supplier?.name + ' ' + defaultValue.supplier?.surname} <br />
              Company : {defaultValue.supplier?.company} <br />
              Email : {defaultValue.supplier?.email}
              <br />
              Phone : {defaultValue.supplier?.phone}
              <br />
              Address : {defaultValue.supplier?.address} */}
            </div>
          </div>
          <div>
            <Image alt="Logo" src={souqLogo} className="w-[90px] h-[90px] mb-4" />
            <p className="text-[#5D6573] font-medium text-[14px] leading-[150%]">
              Manifest Designs Ltd t/a Souq.Studio <br /> Sandstones <br /> Langton Rd <br /> Tunbridge Wells <br /> TN3 0JU <br />
              VAT NO: GB423127335 <br />
              hello@souqdesign.co.uk
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2 col-span-2">
            <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
              PO Number
            </Label>
            <Input
              value={defaultValue?.poNumber}
              className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
              id="poNumber"
              name="poNumber"
              readOnly
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
              Issue Date
            </Label>
            <Form {...form}>
              <form className="flex items-end gap-4 justify-center">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex  w-full flex-col">
                      <Popover>
                        <FormControl>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'justify-between bg-white rounded-lg w-full text-left font-normal',
                                !field.value && 'text-[#595F69]'
                              )}
                            >
                              {field.value ? format(field.value, 'MMM dd, yyyy') : <span>Pick a date</span>}
                              <CalendarIcon className="mr-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                        </FormControl>
                        <PopoverContent className="w-auto pt-3 shadow-2xl bg-white">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={date => {
                              if (date instanceof Date) {
                                field.onChange(date);
                                handleIssueDateChange(date);
                              } else {
                                field.onChange(undefined);
                                handleIssueDateChange(undefined);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>

        {/* Due Date */}
        <div className="space-y-2  col-span-2">
          <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
            Due Date
          </Label>
          <Form {...form2}>
            <form className="flex items-end gap-4 justify-center">
              <FormField
                control={form2.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex  w-full flex-col">
                    <Popover>
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'justify-between bg-white rounded-lg w-full text-left font-normal',
                              !field.value && 'text-[#595F69]'
                            )}
                          >
                            {field.value ? format(field.value, 'MMM dd, yyyy') : <span>Pick a date</span>}
                            <CalendarIcon className="mr-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto pt-3 shadow-2xl bg-white">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={date => {
                            if (date instanceof Date) {
                              field.onChange(date);
                              handleDueDateChange(date);
                            } else {
                              field.onChange(undefined);
                              handleDueDateChange(undefined);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <div className="pt-8 mt-8 border-t">
          <h2 className="text-[#091E42] uppercase font-medium mb-5 text-base">Delivery to:</h2>
          <div className="grid grid-cols-4 mb-4 gap-4">
            <div className="space-y-2  col-span-2">
              <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
                Client Name
              </Label>
              <Input
                onChange={updateClientInfo}
                value={defaultValue?.clientName}
                className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
                id="clientName"
                name="clientName"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
                Client Email
              </Label>
              <Input
                onChange={updateClientInfo}
                value={defaultValue?.clientEmail}
                className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
                id="clientEmail"
                name="clientEmail"
              />
            </div>
          </div>
          <div className="space-y-2 mb-4 col-span-2">
            <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
              Client Phone
            </Label>
            <Input
              onChange={updateClientInfo}
              value={defaultValue?.clientPhone}
              className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
              id="clientPhone"
              name="clientPhone"
            />
          </div>
          <div className="space-y-2 mb-4 col-span-2">
            <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
              Client Address
            </Label>
            <Textarea
              onChange={updateClientInfo}
              value={defaultValue?.clientAddress}
              className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
              id="clientAddress"
              name="clientAddress"
              rows={5}
            />
          </div>
        </div>
        <div className="pt-8 mt-8 border-t">
          <h2 className="text-[#091E42] font-medium uppercase mb-5 text-base">Line Items:</h2>
          {/* <div className="bg-white p-4 gap-4 rounded-[10px] border grid grid-cols-12">
            <div className="space-y-2 mb-4 col-span-6">
              <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
                Description
              </Label>
              <Input
                onChange={updateInfo}
                value={defaultValue?.itemName}
                className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
                id="itemName"
                name="itemName"
              />
            </div>
            <div className="space-y-2 mb-4 col-span-2">
              <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
                Quantity
              </Label>
              <Input
                onChange={updateInfo}
                value={defaultValue?.QTY}
                className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
                id="QTY"
                name="QTY"
              />
            </div>
            <div className="space-y-2 mb-4 col-span-2">
              <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
                Unit Price
              </Label>
              <Input
                onChange={updateInfo}
                value={defaultValue?.amount}
                className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
                id="amount"
                name="amount"
              />
            </div>
            <div className="space-y-2 mb-4 col-span-2">
              <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="poNumber">
                Amount
              </Label>
              <Input
                onChange={updateInfo}
                value={`${defaultValue.projectID == '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'}${
                  defaultValue?.QTY * parseFloat(defaultValue?.amount?.replace(/[^0-9.-]+/g, ''))
                }`}
                className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
                id="totalAmount"
                name="totalAmount"
              />
            </div>
          </div> */}
          <div className="bg-white p-4 rounded-xl">
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th className=" p-2 pb-4 w-[80px] text-left font-normal text-[#091E42] text-[15px]">Image</th>
                  <th className=" p-2 pb-4 text-left font-normal text-[#091E42] text-[15px]">Description</th>
                  <th className=" p-2 pb-4 text-left font-normal text-[#091E42] text-[15px]">Dimensions</th>
                  <th className=" p-2 pb-4 text-left font-normal text-[#091E42] text-[15px]">Quantity</th>
                  <th className=" p-2 pb-4 text-left font-normal text-[#091E42] text-[15px]">Unit Price</th>
                  <th className=" p-2 pb-4 text-left font-normal text-[#091E42] text-[15px]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {defaultValue?.products?.map(item => (
                  <tr>
                    <td>
                      <div className="w-[80px] mb-2 h-[80px] rounded-md border overflow-hidden">
                        {item?.imageURL ? (
                          <img className="w-full h-full object-cover" src={item.imageURL} />
                        ) : (
                          <img className="w-full h-full object-cover" src={errorImage} />
                        )}
                      </div>
                    </td>
                    <td className=" p-2">
                      <textarea
                        rows={3}
                        className="bg-white border h-full rounded-lg text-[15px] font-medium text-[#091E42] w-full py-2 px-2"
                        id="itemName"
                        name="itemName"
                        value={item?.itemName}
                        onChange={e => updateInfo(e, item.itemID)}
                      />
                    </td>
                    <td className=" p-2">
                      <textarea
                        rows={3}
                        className="bg-white border rounded-lg text-[15px] font-medium text-[#091E42] w-full py-2 px-2"
                        id="dimensions"
                        name="dimensions"
                        value={item?.dimensions}
                        onChange={e => updateInfo(e, item.itemID)}
                      />
                    </td>
                    <td className=" p-2">
                      <input
                        className="bg-white border rounded-lg text-[15px] font-medium text-[#091E42] w-full py-2 px-2"
                        id="QTY"
                        name="QTY"
                        value={item?.QTY}
                        onChange={e => updateInfo(e, item.itemID)}
                      />
                    </td>
                    <td className=" p-2">
                      <input
                        className="bg-white border rounded-lg text-[15px] font-medium text-[#091E42] w-full p-2"
                        id="amount"
                        name="amount"
                        value={`${defaultValue.projectID == '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'}${parseFloat(
                          item?.amount?.replace(/[^0-9.-]+/g, '')
                        ).toLocaleString()}`}
                        onChange={e => updateInfo(e, item.itemID)}
                      />
                    </td>
                    <td className=" p-2">
                      <input
                        className="bg-white rounded-lg text-[15px] font-medium text-[#091E42] w-full p-2 border"
                        id="totalAmount"
                        name="totalAmount"
                        value={`${defaultValue.projectID == '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'}${(
                          item?.QTY * parseFloat(item?.amount?.replace(/[^0-9.-]+/g, ''))
                        ).toLocaleString()}`}
                        onChange={e => updateInfo(e, item.itemID)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-6 mt-8 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="">
              <Label className="font-normal mb-2 block text-[#091E42] text-[15px] " htmlFor="delivery_charge">
                Delivery Charge :
              </Label>
              <Input
                step="any" // or "0.01" to limit to 2 decimals
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*" // optional: allow both dot & comma
                onChange={updateClientInfo}
                value={defaultValue?.delivery_charge}
                className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
                id="delivery_charge"
                name="delivery_charge"
                type="number"
              />
            </div>
            <div>
              <Label className="font-normal block mb-2 text-[#091E42] text-[15px] " htmlFor="delivery_charge">
                Status :
              </Label>
              <Select
                value={defaultValue?.status}
                onValueChange={value => {
                  const e = {
                    target: {
                      name: 'status',
                      value: value,
                    },
                  };
                  updateClientInfo(e);
                }}
              >
                <SelectTrigger className="bg-white focus:ring-0 focus:ring-offset-0 text-sm py-1 font-medium w-full focus:border-0 focus-visible:outline-0">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[99]">
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Total Details */}
        <div className="flex pb-9 border-b justify-end">
          <div className="min-w-[220px]  space-y-[14px] text-[#091E42] text-[15px] font-medium">
            <div className="grid grid-cols-4">
              <p className="col-span-2">Subtotal:</p>
              <p className="col-span-2 text-right">{` ${
                defaultValue?.projectID == '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'
              }${subTotal}`}</p>
            </div>
            {defaultValue?.delivery_charge > 0 && (
              <div className="grid grid-cols-4">
                <p className="col-span-2">Delivery Charge:</p>
                <p className="col-span-2 text-right">{`${defaultValue?.projectID == '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'}${
                  defaultValue?.delivery_charge
                }`}</p>
              </div>
            )}
            {/* <div className="grid grid-cols-4">
              <p className="col-span-2">VAT (12%):</p>
              <p className="col-span-2 text-right">{`${
                defaultValue?.projectID == '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'
              }${tax}`}</p>
            </div> */}
            <div className="grid grid-cols-4">
              <p className="col-span-2">Total:</p>
              <p className="col-span-2 text-right">{`${
                defaultValue?.projectID == '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'
              }${subTotalWithDelivery}`}</p>
            </div>
          </div>
        </div>
        {/* Bottom Details */}
        <div className="pt-14 flex items-center justify-between">
          <div>
            <h2 className="text-[#091E42] uppercase font-medium mb-5 text-base">Payment Advace</h2>
            <p className="text-[#5D6573] font-medium text-[15px]">
              Manifest Designs Ltd t/a Souq.Studio <br /> Sandstones <br /> Langton Rd <br /> Tunbridge Wells <br /> TN3 0JU <br />
              VAT NO: GB423127335 <br />
              hello@souqdesign.co.uk
            </p>
          </div>
          <div className="min-w-[220px]  space-y-[14px] text-[#091E42] text-[15px] font-medium">
            <div className="grid grid-cols-4">
              <p className="col-span-2">Document Number</p>
              <p className="col-span-2 text-right">{defaultValue?.poNumber}</p>
            </div>
            <div className="grid grid-cols-4">
              <p className="col-span-2">Amount Due</p>
              <p className="col-span-2 text-right">{defaultValue?.projectID == '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'}0.00</p>
            </div>
            <div className="grid grid-cols-4">
              <p className="col-span-2">Due Date</p>
              <p className="col-span-2 text-right">
                {defaultValue?.dueDate && new Date(defaultValue?.dueDate).toLocaleDateString('en-GB')}
              </p>
            </div>
            <p className="font-medium text-[15px] text-gray-400 pt-4 mt-4 border-t">Enter the amount you are paying above</p>
          </div>
        </div>
      </div>
      {/* </ScrollArea> */}

      <div className="space-y-2 mb-4 col-span-2">
        <Label className="font-normal text-[#091E42] text-[15px] " htmlFor="note">
          Add Note
        </Label>
        <Input
          onChange={updateClientInfo}
          value={defaultValue?.note}
          className="bg-white rounded-lg text-[15px] font-medium text-[#091E42]"
          id="note"
          name="note"
        />
      </div>

      <div className="flex justify-end space-x-4 mt-6  py-4 ">
        <Button
          onClick={handleBack}
          variant="outline"
          type="button"
          className="bg-white rounded-[10px] hover:bg-gray-50 text-gray-700 px-8 py-2"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-[#1e1e1e] rounded-[10px] hover:bg-[#2d2d2d] text-white px-8 py-2">
          Save
        </Button>
      </div>
    </form>
  );
}
