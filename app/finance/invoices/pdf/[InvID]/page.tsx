'use client';
import React, { useState, useEffect } from 'react';
import { CircleArrowDown, Loader, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import logo from '/public/studio.jpeg';
import placeHolder from '/public/product-placeholder-wp.jpg';
import { getInvoices } from '@/supabase/API';
import Image from 'next/image';

// Main Purchase Order Component
const Invoice = ({ params }) => {
  const id = params?.InvID; // dynamic route params
  const [purchaseOrder, setPurchaseOrder] = useState<any[]>([]);

  // React Query
  const { data: InvoiceData, isLoading: InvoiceLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  useEffect(() => {
    if (!InvoiceLoading && InvoiceData?.data) {
      const filteredData = InvoiceData.data.filter((item: any) => item.id == id);
      setPurchaseOrder(filteredData);

      if (filteredData[0]?.inNumber) {
        document.title = `${filteredData[0]?.inNumber}`;
      }
      setTimeout(() => {
        window.print();
      }, 900);
    }
  }, [InvoiceData, InvoiceLoading, id]);

  // Calculate totals
  const calculateTotals = () => {
    // Handle purchaseOrder as an array
    const products = purchaseOrder?.flatMap(order => order.products || []) || [];

    const subTotalNum =
      products.reduce((total, product) => {
        const amount = parseFloat(product?.amount?.replace(/[^0-9.-]+/g, ''));
        return total + amount * product.QTY;
      }, 0) || 0;

    const taxNum = subTotalNum * 0.15;
    const totalWithTaxNum = subTotalNum + taxNum;
    const totalWithDelivery = subTotalNum + Number(purchaseOrder[0]?.delivery_charge);

    return {
      subTotal: subTotalNum.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      tax: taxNum.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      totalWithTax: totalWithTaxNum.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      totalWithDelivery: totalWithDelivery.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  };

  const { subTotal, tax, totalWithTax, totalWithDelivery } = calculateTotals();
  const productsToRender = purchaseOrder?.flatMap(order => order.products || []) || [];

  // Loading state
  if (purchaseOrder?.length < 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" size={32} />
        <span className="ml-2">Loading invoice...</span>
      </div>
    );
  }

  // Souq.Studio PO-${data?.supplier?.company}-${data.projectName}-${data.poNumber}.pdf

  return (
    <div className="w-full max-w-4xl mx-auto bg-white">
      {/* Purchase Order Summary Page */}
      <div className="p-8 text-gray-800">
        {/* Header Section */}
        <div className="flex justify-between mb-16">
          <div className="flex-1">
            <h1 className="text-2xl font-normal mb-1 text-black">Invoice</h1>
            <h2 className="text-xl font-normal mb-5 text-black">#{purchaseOrder[0]?.inNumber}</h2>
            <div className="text-xs leading-relaxed">
              <p>Issue Date: {new Date().toLocaleDateString('en-GB')}</p>
              {/* <p>Due Date: {purchaseOrder?.dueDate ? new Date(purchaseOrder?.dueDate).toLocaleDateString('en-GB') : '-'}</p> */}
              <p>Client Name: {purchaseOrder[0]?.clientName}</p>
              {/* <p>Company: {purchaseOrder[0]?.client?.company}</p> */}
              <p>Email: {purchaseOrder[0]?.clientEmail}</p>
              <p>Phone: {purchaseOrder[0]?.clientPhone}</p>
              <p>Address : {purchaseOrder[0]?.clientAddress}</p>
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="text-left">
              <Image src={logo} alt="Company Logo" className="w-16 h-16 mb-2" />
              <div className="text-xs leading-relaxed">
                <p>Manifest Designs Ltd t/a Souq.Studio</p>
                <p>Sandstones</p>
                <p>Langton Rd</p>
                <p>Tunbridge Wells</p>
                <p>TN3 0JU</p>
                <p>VAT NO: GB423127335</p>
                <p>hello@souqdesign.co.uk</p>
              </div>
            </div>
          </div>
        </div>

        {/* From Section */}
        <div className="mb-6">
          <div className="text-sm leading-relaxed">
            <p>{purchaseOrder?.companyName}</p>
            <p>{purchaseOrder[0]?.clientAddress}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <div className="border-b border-gray-200 mb-2">
            <div className="flex py-3 text-xs text-gray-400">
              <div className="w-1/12">IMAGE</div>
              <div className="w-4/12">DESCRIPTION</div>
              {/* <div className="w-3/12">DIMENSIONS</div> */}
              <div className="w-1/12 text-center">QTY</div>
              <div className="w-3/12 text-right">PRICE</div>
              <div className="w-3/12 text-right">AMOUNT</div>
            </div>
          </div>

          {productsToRender.map((item, index) => (
            <div key={index} className="flex py-3 border-b border-gray-100 text-sm items-center">
              <div className="w-1/12">
                <Image
                  src={item.imageURL || '/public/product-placeholder-wp.jpg'}
                  alt={item.itemName}
                  className="w-10 h-10 object-cover rounded"
                  width={400}
                  height={400}
                />
              </div>
              <div className="w-4/12">{item.itemName}</div>
              {/* <div className="w-3/12">{item?.dimensions}</div> */}
              <div className="w-1/12 text-center">{item.QTY}</div>
              <div className="w-3/12 text-right">
                {purchaseOrder[0]?.projectID === '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'}
                {parseFloat(item?.amount?.replace(/[^0-9.-]+/g, '')).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="w-3/12 text-right">
                {purchaseOrder[0]?.projectID === '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'}
                {(item.QTY * parseFloat(item?.amount?.replace(/[^0-9.-]+/g, ''))).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between mb-2 text-sm">
              <span>Subtotal : </span>
              <span>
                {purchaseOrder[0]?.projectID === '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'}
                {subTotal}
              </span>
            </div>

            <div className="flex justify-between mb-2 text-sm">
              <span>Delivery Charge : </span>
              <span>
                {purchaseOrder[0]?.projectID === '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'}
                {purchaseOrder[0]?.delivery_charge}
              </span>
            </div>

            <div className="flex justify-between font-medium text-sm">
              <span>TOTAL : </span>
              <span>
                {purchaseOrder[0]?.projectID == '0e517ae6-d0fe-4362-a6f9-d1c1d3109f22' ? 'R ' : '£'}
                {totalWithDelivery}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Section */}
        <div className="bg-gray-100 p-4 rounded-md mb-8 print-color-adjust">
          <div className="flex items-center mb-1">
            <Truck size={20} className="text-gray-700" />
            <span className="ml-2 font-medium text-sm">Delivery Address:</span>
          </div>
          <div className="pl-9 text-xs leading-relaxed text-gray-600">
            <p>{purchaseOrder[0]?.clientAddress}</p>
          </div>
          <div className="pl-9 text-xs mt-2 text-gray-500">
            <p>Note: {purchaseOrder[0]?.note}</p>
          </div>
        </div>

        {/* <div className="text-center text-xs text-gray-500">PAGE 1 OF {productsToRender?.length ? productsToRender?.length + 1 : 3}</div> */}
      </div>

      {/* Product Detail Pages */}
      {/* {productsToRender.map((product, index) => (
        <ProductDetailPage key={index} product={product} index={index} projectName={purchaseOrder?.projectName} data={processedData} />
      ))} */}
    </div>
  );
};

// Product Detail Page Component
const ProductDetailPage = ({ product, index, projectName, data }) => {
  return (
    <div className="p-8 text-gray-800 border-t border-gray-200 mt-8 page-break-before">
      {/* Header with project info */}
      <div className="mb-5">
        <p className="text-xs text-gray-700">{projectName || ''}</p>
      </div>

      {/* Product Type & Code Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-black">{product.itemName}</h2>
      </div>

      {/* Product Image */}
      <div className="mb-8">
        <div className="flex justify-between">
          <div className="w-1/3">
            <Image src={product.imageURL || placeHolder} alt={product.itemName} className="w-[250px] h-[250px] object-contain" />
          </div>
        </div>
      </div>

      {/* Product Notes Section */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-700 mb-2">Product Notes</h3>
        {/* Notes content would go here */}
      </div>

      {/* Product Specs Section */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-700 mb-2">Product Specs</h3>

        <div className="flex flex-wrap">
          {/* Left Column */}
          <div className="w-1/2">
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Product Name</p>
              <p className="text-xs font-medium">{product.itemName}</p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Product Dimensions</p>
              <p className="text-xs font-medium">{product?.dimensions}</p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Quantity</p>
              <p className="text-xs font-medium">{product?.QTY}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="mb-5">
        <h3 className="text-sm font-bold text-gray-700 mb-2">Contact Information</h3>

        <div className="flex flex-wrap">
          {/* Left Column */}
          <div className="w-1/2">
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Supplier Name</p>
              <p className="text-xs font-medium">{data?.supplier?.company}</p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Supplier Contact</p>
              <p className="text-xs font-medium">{data?.supplier?.company}</p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <p className="text-xs font-medium">{data?.supplier?.phone}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-1/2">
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Email Address</p>
              <p className="text-xs font-medium">{data?.supplier?.email}</p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Supplier Address</p>
              <p className="text-xs font-medium">{data?.supplier?.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="text-center text-xs text-gray-500 mt-16">
        PAGE {index + 2} OF {data?.products?.length + 1}
      </div> */}
    </div>
  );
};

export default Invoice;
