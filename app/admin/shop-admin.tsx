"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatGBP } from "@/lib/shop/money";
import type { ShopCategory, ShopOrderSummary, ShopProduct } from "@/lib/shop/types";
import styles from "./admin.module.css";

type ShopView = "products" | "categories" | "orders";
type Editor = "product" | "category" | null;

type ImageForm = { id?: string; objectKey: string; url: string; alt: string };
type VariantForm = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  active: boolean;
};
type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  kind: "physical" | "digital";
  summary: string;
  description: string;
  downloadMp3Key: string;
  downloadMp3Name: string;
  downloadWavKey: string;
  downloadWavName: string;
  downloadZipKey: string;
  downloadZipName: string;
  featured: boolean;
  active: boolean;
  images: ImageForm[];
  variants: VariantForm[];
};
type CategoryForm = { id?: string; name: string; slug: string; active: boolean };

function newProduct(categoryId = ""): ProductForm {
  return {
    name: "",
    slug: "",
    categoryId,
    kind: "physical",
    summary: "",
    description: "",
    downloadMp3Key: "",
    downloadMp3Name: "",
    downloadWavKey: "",
    downloadWavName: "",
    downloadZipKey: "",
    downloadZipName: "",
    featured: false,
    active: true,
    images: [],
    variants: [{ name: "Default", sku: "", price: "", stock: "0", active: true }],
  };
}

function productToForm(product: ShopProduct): ProductForm {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    kind: product.kind,
    summary: product.summary,
    description: product.description,
    downloadMp3Key: product.downloads.mp3 || "",
    downloadMp3Name: product.downloads.mp3?.split("/").pop() || "",
    downloadWavKey: product.downloads.wav || "",
    downloadWavName: product.downloads.wav?.split("/").pop() || "",
    downloadZipKey: product.downloads.zip || "",
    downloadZipName: product.downloads.zip?.split("/").pop() || "",
    featured: product.featured,
    active: product.active,
    images: product.images.map((image) => ({
      id: image.id,
      objectKey: image.objectKey || "",
      url: image.url,
      alt: image.alt,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: (variant.priceGBP / 100).toFixed(2),
      stock: variant.stock === null ? "" : String(variant.stock),
      active: variant.active,
    })),
  };
}

async function shopApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;
  if (!response.ok) throw new Error(payload?.error || "Request failed");
  return payload?.data as T;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function move<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

export default function ShopAdmin() {
  const [view, setView] = useState<ShopView>("products");
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrderSummary[]>([]);
  const [editor, setEditor] = useState<Editor>(null);
  const [productForm, setProductForm] = useState<ProductForm>(() => newProduct());
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({ name: "", slug: "", active: true });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [catalog, orderRows] = await Promise.all([
        shopApi<{ categories: ShopCategory[]; products: ShopProduct[] }>("/api/admin/shop/products"),
        shopApi<ShopOrderSummary[]>("/api/admin/shop/orders"),
      ]);
      setCategories(catalog.categories);
      setProducts(catalog.products);
      setOrders(orderRows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Shop data could not be loaded");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    if (!editor) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setEditor(null);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [editor]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      [product.name, product.categoryName, ...product.variants.map((variant) => variant.sku)]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [products, query]);

  function openProduct(product?: ShopProduct) {
    setMessage("");
    setError("");
    setProductForm(product ? productToForm(product) : newProduct(categories[0]?.id || ""));
    setEditor("product");
  }

  function openCategory(category?: ShopCategory) {
    setMessage("");
    setError("");
    setCategoryForm(
      category
        ? { id: category.id, name: category.name, slug: category.slug, active: category.active }
        : { name: "", slug: "", active: true }
    );
    setEditor("category");
  }

  async function upload(file: File, purpose: "image" | "download") {
    const form = new FormData();
    form.append("file", file);
    return shopApi<{ key: string; url: string | null; name: string }>(
      `/api/admin/shop/assets?purpose=${purpose}`,
      { method: "POST", body: form }
    );
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPending(true);
    setError("");
    try {
      const asset = await upload(file, "image");
      setProductForm((form) => ({
        ...form,
        images: [...form.images, { objectKey: asset.key, url: asset.url || "", alt: form.name }],
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Image upload failed");
    } finally {
      setPending(false);
      event.target.value = "";
    }
  }

  async function uploadDownload(event: React.ChangeEvent<HTMLInputElement>, format: "mp3" | "wav" | "zip") {
    const file = event.target.files?.[0];
    if (!file) return;
    setPending(true);
    setError("");
    try {
      const asset = await upload(file, "download");
      setProductForm((form) => ({
        ...form,
        ...(format === "mp3" ? { downloadMp3Key: asset.key, downloadMp3Name: asset.name } : {}),
        ...(format === "wav" ? { downloadWavKey: asset.key, downloadWavName: asset.name } : {}),
        ...(format === "zip" ? { downloadZipKey: asset.key, downloadZipName: asset.name } : {}),
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "File upload failed");
    } finally {
      setPending(false);
      event.target.value = "";
    }
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const body = {
        id: productForm.id,
        name: productForm.name,
        slug: productForm.slug,
        categoryId: productForm.categoryId,
        kind: productForm.kind,
        summary: productForm.summary,
        description: productForm.description,
        downloadKey: productForm.kind === "digital" ? productForm.downloadZipKey : null,
        downloads: productForm.kind === "digital"
          ? { mp3: productForm.downloadMp3Key || null, wav: productForm.downloadWavKey || null, zip: productForm.downloadZipKey || null }
          : { mp3: null, wav: null, zip: null },
        featured: productForm.featured,
        active: productForm.active,
        images: productForm.images.map((image) => ({
          id: image.id,
          objectKey: image.objectKey || null,
          url: image.objectKey ? undefined : image.url,
          alt: image.alt,
        })),
        variants: productForm.variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          priceGBP: Math.round(Number(variant.price) * 100),
          stock: productForm.kind === "digital" ? null : Number(variant.stock),
          active: variant.active,
        })),
      };
      await shopApi("/api/admin/shop/products", {
        method: productForm.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      setEditor(null);
      setMessage(productForm.id ? "Product updated." : "Product added to the catalogue.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Product could not be saved");
    } finally {
      setPending(false);
    }
  }

  async function deleteProduct(product: ShopProduct) {
    if (!window.confirm(`Delete “${product.name}” and its uploaded files? This cannot be undone.`)) return;
    setError("");
    try {
      await shopApi("/api/admin/shop/products", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });
      setMessage("Product deleted.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Product could not be deleted");
    }
  }

  async function saveCategory(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await shopApi("/api/admin/shop/categories", {
        method: categoryForm.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      setEditor(null);
      setMessage(categoryForm.id ? "Category updated." : "Category added.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Category could not be saved");
    } finally {
      setPending(false);
    }
  }

  async function deleteCategory(category: ShopCategory) {
    if (!window.confirm(`Delete the “${category.name}” category?`)) return;
    setError("");
    try {
      await shopApi("/api/admin/shop/categories", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: category.id }),
      });
      setMessage("Category deleted.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Category could not be deleted");
    }
  }

  async function setFulfillment(id: string, fulfillmentStatus: string) {
    setError("");
    try {
      await shopApi("/api/admin/shop/orders", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, fulfillmentStatus }),
      });
      setOrders((current) => current.map((order) => order.id === id ? { ...order, fulfillmentStatus } : order));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Order could not be updated");
    }
  }

  async function orderAction(order: ShopOrderSummary, action: "refund" | "regenerate-downloads") {
    if (action === "refund" && !window.confirm(`Refund ${formatGBP(order.amountTotal)} to ${order.email}?`)) return;
    setError("");
    try {
      await shopApi("/api/admin/shop/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: order.id, action }),
      });
      setMessage(action === "refund" ? "Order refunded through Stripe." : "Download links renewed for 24 hours.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Order action failed");
    }
  }

  return (
    <section className={`${styles.contentSection} ${styles.shopAdmin}`}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Public /shop</p>
          <h2>Shop</h2>
          <p className={styles.sectionIntro}>Manage the catalogue, stock, digital files and paid orders.</p>
        </div>
        {view === "products" ? <button className={styles.primaryButton} disabled={!categories.length} type="button" onClick={() => openProduct()}>New product</button> : null}
        {view === "categories" ? <button className={styles.primaryButton} type="button" onClick={() => openCategory()}>New category</button> : null}
      </div>

      <nav className={styles.shopSubnav} aria-label="Shop management sections">
        {(["products", "categories", "orders"] as ShopView[]).map((item) => (
          <button className={view === item ? styles.shopSubnavActive : ""} key={item} type="button" onClick={() => setView(item)}>{item}</button>
        ))}
      </nav>
      {message ? <p className={styles.status}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {view === "products" ? (
        <>
          <div className={styles.shopToolbar}>
            <label><span className={styles.eyebrow}>Search catalogue</span><input placeholder="Name, category or SKU" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <span>{filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}</span>
          </div>
          {!categories.length ? (
            <div className={styles.shopCallout}><strong>Add a category first</strong><p>Products need a category before they can be created.</p><button className={styles.secondaryButton} type="button" onClick={() => { setView("categories"); openCategory(); }}>Create category</button></div>
          ) : null}
          <div className={styles.tableWrap}>
            <table>
              <thead><tr><th>Product</th><th>Category</th><th>Options</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredProducts.length ? filteredProducts.map((product) => {
                  const stock = product.kind === "digital" ? null : product.variants.reduce((total, variant) => total + (variant.stock ?? 0), 0);
                  return (
                    <tr key={product.id}>
                      <td data-label="Product"><strong>{product.name}</strong><span>/{product.slug}</span></td>
                      <td data-label="Category">{product.categoryName}</td>
                      <td data-label="Options">{product.variants.length}</td>
                      <td data-label="Stock">{stock === null ? "Unlimited" : stock}</td>
                      <td data-label="Status"><span className={styles.badge}>{product.active ? "Published" : "Draft"}{product.featured ? " · Featured" : ""}</span></td>
                      <td data-label="Actions"><div className={styles.shopRowActions}><button type="button" onClick={() => openProduct(product)}>Edit</button><button className={styles.shopDeleteAction} type="button" onClick={() => void deleteProduct(product)}>Delete</button></div></td>
                    </tr>
                  );
                }) : <tr><td className={styles.emptyTableCell} colSpan={6}>No products have been added yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {view === "categories" ? (
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>Category</th><th>URL</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.length ? categories.map((category) => (
                <tr key={category.id}>
                  <td data-label="Category"><strong>{category.name}</strong></td>
                  <td data-label="URL">/{category.slug}</td>
                  <td data-label="Products">{products.filter((product) => product.categoryId === category.id).length}</td>
                  <td data-label="Status"><span className={styles.badge}>{category.active ? "Visible" : "Hidden"}</span></td>
                  <td data-label="Actions"><div className={styles.shopRowActions}><button type="button" onClick={() => openCategory(category)}>Edit</button><button className={styles.shopDeleteAction} type="button" onClick={() => void deleteCategory(category)}>Delete</button></div></td>
                </tr>
              )) : <tr><td className={styles.emptyTableCell} colSpan={5}>No categories yet. Add one to begin the catalogue.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : null}

      {view === "orders" ? (
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Fulfilment</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.length ? orders.map((order) => (
                <tr key={order.id}>
                  <td data-label="Customer"><strong>{order.email || "No email"}</strong><span>{order.id}</span></td>
                  <td data-label="Date">{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                  <td data-label="Items">{order.itemCount}</td>
                  <td data-label="Total">{formatGBP(order.amountTotal)}{order.presentmentCurrency && order.presentmentCurrency !== "GBP" ? <span>Paid in {order.presentmentCurrency}</span> : null}</td>
                  <td data-label="Payment"><span className={styles.badge}>{order.paymentStatus}</span></td>
                  <td data-label="Fulfilment"><select value={order.fulfillmentStatus} onChange={(event) => void setFulfillment(order.id, event.target.value)}><option value="unfulfilled">Unfulfilled</option><option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option></select></td>
                  <td data-label="Actions"><div className={styles.shopRowActions}><button type="button" onClick={() => void orderAction(order, "regenerate-downloads")}>Renew links</button><button className={styles.shopDeleteAction} disabled={order.paymentStatus === "refunded"} type="button" onClick={() => void orderAction(order, "refund")}>Refund</button></div></td>
                </tr>
              )) : <tr><td className={styles.emptyTableCell} colSpan={7}>Paid Stripe orders will appear here.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : null}

      {editor ? (
        <div className={styles.modalLayer}>
          <button aria-label="Close editor" className={styles.modalScrim} type="button" onClick={() => setEditor(null)} />
          <section aria-modal="true" className={`${styles.editorModal} ${editor === "product" ? styles.shopEditorModal : ""}`} role="dialog">
            <header className={styles.modalHeader}>
              <div><p className={styles.eyebrow}>{editor === "product" ? "Catalogue editor" : "Catalogue structure"}</p><h3>{editor === "product" ? `${productForm.id ? "Edit" : "Add"} product` : `${categoryForm.id ? "Edit" : "Add"} category`}</h3></div>
              <button aria-label="Close editor" className={styles.closeButton} type="button" onClick={() => setEditor(null)}>×</button>
            </header>

            {editor === "category" ? (
              <form className={styles.editPanel} onSubmit={saveCategory}>
                <label>Name<input autoFocus required value={categoryForm.name} onChange={(event) => setCategoryForm((form) => ({ ...form, name: event.target.value, slug: form.id || form.slug ? form.slug : slugify(event.target.value) }))} /></label>
                <label>URL slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={categoryForm.slug} onChange={(event) => setCategoryForm((form) => ({ ...form, slug: slugify(event.target.value) }))} /></label>
                <label className={styles.checkboxLabel}><input checked={categoryForm.active} type="checkbox" onChange={(event) => setCategoryForm((form) => ({ ...form, active: event.target.checked }))} />Visible in the shop</label>
                <div className={styles.modalActions}><button className={styles.secondaryButton} type="button" onClick={() => setEditor(null)}>Cancel</button><button className={styles.primaryButton} disabled={pending} type="submit">{pending ? "Saving…" : "Save category"}</button></div>
              </form>
            ) : null}

            {editor === "product" ? (
              <form className={`${styles.editPanel} ${styles.shopProductForm}`} onSubmit={saveProduct}>
                <div className={styles.shopFormGrid}>
                  <label>Name<input autoFocus required value={productForm.name} onChange={(event) => setProductForm((form) => ({ ...form, name: event.target.value, slug: form.id || form.slug ? form.slug : slugify(event.target.value) }))} /></label>
                  <label>URL slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={productForm.slug} onChange={(event) => setProductForm((form) => ({ ...form, slug: slugify(event.target.value) }))} /></label>
                  <label>Category<select required value={productForm.categoryId} onChange={(event) => setProductForm((form) => ({ ...form, categoryId: event.target.value }))}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                  <label>Type<select value={productForm.kind} onChange={(event) => setProductForm((form) => ({ ...form, kind: event.target.value as ProductForm["kind"] }))}><option value="physical">Physical</option><option value="digital">Digital download</option></select></label>
                </div>
                <label>Short summary<input required maxLength={180} value={productForm.summary} onChange={(event) => setProductForm((form) => ({ ...form, summary: event.target.value }))} /></label>
                <label>Description<textarea required rows={5} value={productForm.description} onChange={(event) => setProductForm((form) => ({ ...form, description: event.target.value }))} /></label>
                <div className={styles.shopChecks}><label className={styles.checkboxLabel}><input checked={productForm.active} type="checkbox" onChange={(event) => setProductForm((form) => ({ ...form, active: event.target.checked }))} />Published</label><label className={styles.checkboxLabel}><input checked={productForm.featured} type="checkbox" onChange={(event) => setProductForm((form) => ({ ...form, featured: event.target.checked }))} />Featured</label></div>

                <fieldset className={styles.shopFieldset}>
                  <legend>Product images</legend>
                  <label className={styles.uploadButton}>{pending ? "Uploading…" : "Upload image"}<input accept="image/png,image/jpeg,image/webp,image/avif" disabled={pending} type="file" onChange={(event) => void uploadImage(event)} /></label>
                  <div className={styles.shopImageList}>
                    {productForm.images.map((image, index) => (
                      <div key={`${image.url}-${index}`}>
                        <div className={styles.shopImagePreview}>{image.url ? <Image alt="" fill sizes="96px" src={image.url} unoptimized /> : null}</div>
                        <label>Alt text<input required value={image.alt} onChange={(event) => setProductForm((form) => ({ ...form, images: form.images.map((item, itemIndex) => itemIndex === index ? { ...item, alt: event.target.value } : item) }))} /></label>
                        <div className={styles.shopMiniActions}><button disabled={index === 0} type="button" onClick={() => setProductForm((form) => ({ ...form, images: move(form.images, index, -1) }))}>Up</button><button disabled={index === productForm.images.length - 1} type="button" onClick={() => setProductForm((form) => ({ ...form, images: move(form.images, index, 1) }))}>Down</button><button type="button" onClick={() => setProductForm((form) => ({ ...form, images: form.images.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</button></div>
                      </div>
                    ))}
                  </div>
                </fieldset>

                {productForm.kind === "digital" ? (
                  <fieldset className={styles.shopFieldset}>
                    <legend>Private music downloads</legend>
                    <p className={styles.formNote}>ZIP is required and appears immediately after payment. The delivery email also offers any uploaded MP3 and WAV files.</p>
                    <label className={styles.uploadButton}>{pending ? "Uploading…" : productForm.downloadZipName ? "Replace ZIP" : "Upload ZIP"}<input accept=".zip,application/zip" disabled={pending} type="file" onChange={(event) => void uploadDownload(event, "zip")} /></label>
                    {productForm.downloadZipName ? <p className={styles.shopFileName}>ZIP: {productForm.downloadZipName}</p> : null}
                    <label className={styles.uploadButton}>{pending ? "Uploading…" : productForm.downloadMp3Name ? "Replace MP3" : "Upload MP3"}<input accept=".mp3,audio/mpeg" disabled={pending} type="file" onChange={(event) => void uploadDownload(event, "mp3")} /></label>
                    {productForm.downloadMp3Name ? <p className={styles.shopFileName}>MP3: {productForm.downloadMp3Name}</p> : null}
                    <label className={styles.uploadButton}>{pending ? "Uploading…" : productForm.downloadWavName ? "Replace WAV" : "Upload WAV"}<input accept=".wav,audio/wav" disabled={pending} type="file" onChange={(event) => void uploadDownload(event, "wav")} /></label>
                    {productForm.downloadWavName ? <p className={styles.shopFileName}>WAV: {productForm.downloadWavName}</p> : null}
                  </fieldset>
                ) : null}

                <fieldset className={styles.shopFieldset}>
                  <legend>Options and stock</legend>
                  <div className={styles.shopVariantList}>
                    {productForm.variants.map((variant, index) => (
                      <div className={styles.shopVariant} key={variant.id || index}>
                        <label>Option name<input required placeholder="S, Red, Standard…" value={variant.name} onChange={(event) => setProductForm((form) => ({ ...form, variants: form.variants.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} /></label>
                        <label>SKU<input required value={variant.sku} onChange={(event) => setProductForm((form) => ({ ...form, variants: form.variants.map((item, itemIndex) => itemIndex === index ? { ...item, sku: event.target.value } : item) }))} /></label>
                        <label>Price £<input min="0" required step="0.01" type="number" value={variant.price} onChange={(event) => setProductForm((form) => ({ ...form, variants: form.variants.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item) }))} /></label>
                        {productForm.kind === "physical" ? <label>Stock<input min="0" required step="1" type="number" value={variant.stock} onChange={(event) => setProductForm((form) => ({ ...form, variants: form.variants.map((item, itemIndex) => itemIndex === index ? { ...item, stock: event.target.value } : item) }))} /></label> : null}
                        <label className={styles.checkboxLabel}><input checked={variant.active} type="checkbox" onChange={(event) => setProductForm((form) => ({ ...form, variants: form.variants.map((item, itemIndex) => itemIndex === index ? { ...item, active: event.target.checked } : item) }))} />Available</label>
                        <button className={styles.shopRemoveVariant} disabled={productForm.variants.length === 1} type="button" onClick={() => setProductForm((form) => ({ ...form, variants: form.variants.filter((_, itemIndex) => itemIndex !== index) }))}>Remove option</button>
                      </div>
                    ))}
                  </div>
                  <button className={styles.secondaryButton} type="button" onClick={() => setProductForm((form) => ({ ...form, variants: [...form.variants, { name: "", sku: "", price: "", stock: "0", active: true }] }))}>Add another option</button>
                </fieldset>

                <div className={styles.modalActions}><button className={styles.secondaryButton} type="button" onClick={() => setEditor(null)}>Cancel</button><button className={styles.primaryButton} disabled={pending} type="submit">{pending ? "Saving…" : "Save product"}</button></div>
              </form>
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
}
