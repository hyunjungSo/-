"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "citizen" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  contact?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 테스트용 더미 사용자
const dummyUsers: { email: string; password: string; user: User }[] = [
  {
    email: "citizen@test.com",
    password: "1234",
    user: {
      id: "citizen-1",
      name: "홍길동",
      email: "citizen@test.com",
      role: "citizen",
      contact: "010-1234-5678",
    },
  },
  {
    email: "admin@test.com",
    password: "1234",
    user: {
      id: "admin-1",
      name: "김담당",
      email: "admin@test.com",
      role: "admin",
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 세션 스토리지에서 사용자 정보 복원
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // 간단한 인증 시뮬레이션
    const found = dummyUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      setUser(found.user);
      sessionStorage.setItem("user", JSON.stringify(found.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
