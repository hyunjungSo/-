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
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 테스트용 더미 사용자
const dummyUsers: { userId: string; password: string; user: User }[] = [
  {
    userId: "citizen",
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
    userId: "admin",
    password: "1234",
    user: {
      id: "admin-1",
      name: "홍길동",
      email: "admin@test.com",
      role: "admin",
    },
  },
];

// 기본 로그인 사용자 (로그인 화면 없이 바로 서비스 이용)
const defaultUser: User = {
  id: "citizen-1",
  name: "홍길동",
  email: "citizen@test.com",
  role: "citizen",
  contact: "010-1234-5678",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 이미 기본 사용자로 로그인 되어 있으므로 추가 작업 불필요
  }, []);

  const login = async (userId: string, password: string): Promise<boolean> => {
    // 간단한 인증 시뮬레이션
    const found = dummyUsers.find(
      (u) => u.userId === userId && u.password === password
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
