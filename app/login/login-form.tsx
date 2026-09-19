"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const title = mode === "signin" ? "登录工作室" : "创建账号";
  const submitLabel = useMemo(() => {
    if (pending) return mode === "signin" ? "正在登录…" : "正在注册…";
    return mode === "signin" ? "登录" : "注册";
  }, [mode, pending]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          setMessage("注册成功。请查收确认邮件后再登录。");
          setMode("signin");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }

      const destination =
        nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/products";
      router.push(destination);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "认证失败，请重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="listing-shell auth-shell">
      <div className="listing-atmosphere" aria-hidden="true" />

      <header className="listing-hero">
        <p className="listing-kicker">Nexus Supply</p>
        <h1 className="listing-brand">{title}</h1>
        <p className="listing-lede">
          使用邮箱和密码进入产品大厅。未登录无法访问供应链目录与 AI 铺货工具。
        </p>
      </header>

      <form className="listing-form" onSubmit={handleSubmit}>
        <div className="auth-mode-switch" role="tablist" aria-label="登录或注册">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            className={`auth-mode-btn${mode === "signin" ? " is-active" : ""}`}
            onClick={() => {
              setMode("signin");
              setError(null);
              setMessage(null);
            }}
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={`auth-mode-btn${mode === "signup" ? " is-active" : ""}`}
            onClick={() => {
              setMode("signup");
              setError(null);
              setMessage(null);
            }}
          >
            注册
          </button>
        </div>

        <label className="listing-field">
          <span className="listing-field-label">邮箱</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@studio.com"
            disabled={pending}
          />
        </label>

        <label className="listing-field">
          <span className="listing-field-label">密码</span>
          <span className="listing-field-hint">至少 6 位字符</span>
          <input
            type="password"
            name="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            disabled={pending}
          />
        </label>

        {error ? (
          <p className="listing-status is-error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="listing-status is-saved" role="status">
            {message}
          </p>
        ) : null}

        <div className="listing-actions">
          <button
            type="submit"
            className="listing-btn listing-btn-primary"
            disabled={pending}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
