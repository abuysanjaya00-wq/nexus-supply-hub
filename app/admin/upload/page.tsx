"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import { importProductsSpreadsheetAction } from "@/app/actions/productActions";
import SignOutButton from "@/app/components/sign-out-button";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function AdminUploadPage() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setErrorMsg(null);
    setSuccessCount(null);
    setFilename(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await importProductsSpreadsheetAction(formData);
      if (!result.ok) {
        setStatus("error");
        setErrorMsg(result.error);
        return;
      }

      setStatus("success");
      setSuccessCount(result.data.count);
      setFilename(result.data.filename);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "上传解析失败");
    } finally {
      event.target.value = "";
    }
  }

  const uploading = status === "uploading";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between">
        <Link
          href="/products"
          className="text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          ← Back to Product Hall
        </Link>
        <SignOutButton />
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              供应链表格批量导入
            </h1>
            <p className="text-sm text-slate-500">
              支持 Excel / CSV，智能识别中英文表头，按 SKU upsert 写入{" "}
              <code className="font-mono text-xs">products</code>。
            </p>
          </div>
        </div>

        <div className="mb-8 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">支持的表头（中英均可）：</p>
          <p className="font-mono leading-relaxed text-indigo-600">
            sku / 货号 · name / 商品名称 · style / 款式 · specs / 规格 ·
            weight_g / 重量(克) · material / 材质 · min_price / 最低售价 · notes
            / 备注 · image_url / 图片
          </p>
          <p className="text-slate-500">
            可选：category / 品类 · supply_mode / 供应模式（Dropship Ready /
            OEM）
          </p>
          <p className="text-slate-500">格式：.xlsx · .xls · .csv（读取第一个工作表）</p>
        </div>

        <div
          className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
            uploading
              ? "border-indigo-400 bg-indigo-50/40"
              : "border-slate-300 bg-slate-50/50 hover:border-indigo-500"
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            onChange={handleFileUpload}
            className="hidden"
            id="sheet-upload"
            disabled={uploading}
          />
          <label
            htmlFor="sheet-upload"
            className={`flex flex-col items-center ${
              uploading ? "cursor-wait" : "cursor-pointer"
            }`}
          >
            {uploading ? (
              <Loader2 className="mb-3 h-12 w-12 animate-spin text-indigo-600" />
            ) : (
              <Upload className="mb-3 h-12 w-12 text-slate-400" />
            )}
            <span className="text-base font-semibold text-slate-700">
              {uploading
                ? `正在解析并同步 ${filename ?? "文件"}…`
                : "点击上传 .xlsx / .xls / .csv"}
            </span>
            <span className="mt-1 text-xs text-slate-400">
              {uploading
                ? "请勿关闭页面，批量写入 Supabase 中"
                : "Upsert by SKU · 需登录且配置 SUPABASE_SERVICE_ROLE_KEY"}
            </span>
          </label>
        </div>

        {status === "success" && successCount !== null ? (
          <div className="mt-6 flex items-start space-x-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            <div className="text-sm">
              <p>
                成功导入 <strong>{successCount}</strong> 条商品到 Nexus Supply。
              </p>
              {filename ? (
                <p className="mt-1 text-emerald-700/80">文件：{filename}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {status === "error" && errorMsg ? (
          <div className="mt-6 flex items-start space-x-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />
            <div className="text-sm">
              <p className="font-semibold">导入失败</p>
              <p className="mt-1 break-words">{errorMsg}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
