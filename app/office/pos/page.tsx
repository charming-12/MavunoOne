"use client";

import { useMemo, useState } from "react";
import { Search, ShoppingCart, Trash2, DollarSign, Plus, Minus, Loader2, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  unit: string;
  packageSizeKg: number;
};

export default function POSPage() {
  const productsQuery = trpc.products.list.useQuery();
  const createSale = trpc.sales.create.useMutation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [successMessage, setSuccessMessage] = useState("");

  const products = productsQuery.data ?? [];
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cart]);

  const addToCart = (product: (typeof products)[number]) => {
    const stock = Number(product.currentStock ?? 0);
    const packageSizeKg = Number(product.packageSizeKg ?? 1);
    const sellableUnits = Math.floor(stock / packageSizeKg);
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= sellableUnits) return current;
        return current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (sellableUnits <= 0) return current;
        return [...current, { productId: product.id, name: product.name, price: Number(product.sellPrice ?? 0), quantity: 1, stock: Math.floor(stock / Number(product.packageSizeKg ?? 1)), unit: product.unit, packageSizeKg: Number(product.packageSizeKg ?? 1) }];
    });
    setSuccessMessage("");
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((current) => current.flatMap((item) => {
      if (item.productId !== productId) return [item];
      const quantity = item.quantity + delta;
      return quantity <= 0 ? [] : quantity > item.stock ? [item] : [{ ...item, quantity }];
    }));
  };

  const completeSale = async () => {
    if (!cart.length || createSale.isPending) return;
    setSuccessMessage("");
    try {
      const result = await createSale.mutateAsync({
        totalAmount,
        paymentMethod,
        paidAmount: paymentMethod === "credit" ? 0 : totalAmount,
        balance: paymentMethod === "credit" ? totalAmount : 0,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.price, discount: 0, total: item.price * item.quantity })),
      });
      setCart([]);
      setSuccessMessage(`Mauzo yamehifadhiwa. Invoice: ${result.invoiceNumber}`);
      await productsQuery.refetch();
    } catch (error) {
      setSuccessMessage(error instanceof Error ? error.message : "Mauzo hayakuhifadhiwa. Tafadhali jaribu tena.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Sales terminal</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">POS — Mauzo</h1>
        <p className="mt-2 text-slate-500">Chagua bidhaa kutoka stock halisi na hifadhi mauzo moja kwa moja.</p>
      </div>

      {successMessage && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} />{successMessage}</div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section>
          <div className="relative mb-4"><Search className="absolute left-3 top-3 text-slate-400" size={20} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tafuta bidhaa..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div>
          {productsQuery.isLoading ? <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-12 text-slate-500"><Loader2 className="animate-spin" size={20} />Inapakia bidhaa...</div> : productsQuery.error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">Imeshindikana kupakia bidhaa. Hakikisha umeingia kama staff.</div> : filteredProducts.length === 0 ? <div className="rounded-2xl bg-white p-12 text-center text-slate-500">Hakuna bidhaa inayopatikana.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((product) => { const stock = Number(product.currentStock ?? 0); return <button key={product.id} type="button" disabled={Math.floor(stock / Number(product.packageSizeKg ?? 1)) <= 0} onClick={() => addToCart(product)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{product.name}</p><p className="mt-1 text-sm font-semibold text-emerald-700">TZS {Number(product.sellPrice ?? 0).toLocaleString()}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${stock <= Number(product.lowStockThreshold ?? 0) ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{product.packageSizeKg && Number(product.packageSizeKg) > 1 ? `${(stock / Number(product.packageSizeKg)).toLocaleString()} ${product.unit}` : `${stock} ${product.unit}`}</span></div><span className="mt-5 flex items-center gap-1 text-xs font-bold text-emerald-700"><Plus size={14} />Ongeza kwenye cart</span></button>; })}</div>}
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6"><div className="mb-4 flex items-center gap-2"><ShoppingCart size={20} className="text-emerald-600" /><h2 className="text-lg font-black text-slate-900">Cart ya Mauzo</h2></div><div className="max-h-96 space-y-3 overflow-y-auto">{cart.length === 0 ? <p className="py-12 text-center text-sm text-slate-400">Hakuna bidhaa kwenye cart.</p> : cart.map((item) => <div key={item.productId} className="rounded-xl bg-slate-50 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-bold text-slate-900">{item.name}</p><p className="text-xs text-slate-500">TZS {item.price.toLocaleString()} × {item.quantity} {item.unit} ({(item.quantity * item.packageSizeKg).toLocaleString()} kg)</p></div><button type="button" onClick={() => setCart((current) => current.filter((entry) => entry.productId !== item.productId))} className="text-red-500"><Trash2 size={16} /></button></div><div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-2"><button type="button" onClick={() => updateQuantity(item.productId, -1)} className="rounded-lg border border-slate-200 bg-white p-1"><Minus size={14} /></button><span className="min-w-6 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.productId, 1)} className="rounded-lg border border-slate-200 bg-white p-1"><Plus size={14} /></button></div><span className="font-black text-emerald-700">TZS {(item.price * item.quantity).toLocaleString()}</span></div></div>)}</div><div className="mt-5 border-t border-slate-200 pt-4"><div className="mb-4 flex items-center justify-between"><span className="text-slate-600">Jumla</span><span className="text-2xl font-black text-emerald-700">TZS {totalAmount.toLocaleString()}</span></div><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500"><option value="cash">Pesa taslimu</option><option value="mpesa">M-Pesa</option><option value="credit">Deni (Credit)</option></select><button type="button" disabled={!cart.length || createSale.isPending} onClick={completeSale} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"><DollarSign size={19} />{createSale.isPending ? "Inahifadhi..." : "Kamilisha Mauzo"}</button></div></aside>
      </div>
    </div>
  );
}
