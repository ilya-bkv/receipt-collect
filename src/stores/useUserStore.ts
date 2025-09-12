import { create } from 'zustand';

export type UseUserStore = {
  id: string | null;
  avatar: string | null;
  nicName: string | null;
  goals: number;
  receipts: string[];
};

export type UserStore = UseUserStore & {
  updateUser: (user: Partial<UseUserStore>) => void;
  resetUser: () => void;
  addGoals: (value: number) => void;
  addReceipt: (receiptId: string) => void;
  setUser: (user: UseUserStore) => void;
};

export const initialState: UseUserStore = {
  id: null,
  avatar: null,
  nicName: null,
  goals: 0,
  receipts: []
};

export const useUserStore = create<UserStore>()((set) => ({
  ...initialState,

  updateUser: (user) => set((state) => ({...state, ...user})),
  resetUser: () => set(() => ({...initialState})),
  addGoals: (value) =>
    set((state) => ({
      goals: state.goals + value
    })),
  addReceipt: (receiptId) =>
    set((state) => ({
      receipts: [...state.receipts, receiptId]
    })),
  setUser: (user) => set(() => ({...user}))
}));
