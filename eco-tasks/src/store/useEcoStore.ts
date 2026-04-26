import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';
import { getDailyTasks, ALL_TASKS } from '../data/tasks';

export interface CompletedTask {
  taskId: string;
  completedAt: string;
  photoDataUrl?: string;
}

export interface DayRecord {
  date: string;
  completedTasks: CompletedTask[];
  allDone: boolean;
}

interface EcoStore {
  streak: number;
  monthlyDays: number;
  totalXal: number;
  earnedCoins: number;
  spentCoins: number;
  history: DayRecord[];
  redeemedPrizes: string[];
  synced: boolean;
  dailyAssignment: { date: string; ids: string[] } | null;

  coinBalance: () => number;
  completeTask: (date: string, taskId: string, photoDataUrl?: string, totalDailyTasks?: number) => void;
  getDay: (date: string) => DayRecord | undefined;
  redeemPrize: (prizeId: string) => void;
  spendCoins: (amount: number) => boolean;
  resetMonth: () => void;
  syncWithDB: () => Promise<void>;
  getDailyAssignment: (date: string, userId: number) => string[];
}

function getTaskXal(taskId: string): number {
  return ALL_TASKS.find(t => t.id === taskId)?.xal ?? 30;
}
function getTaskCoin(taskId: string): number {
  return ALL_TASKS.find(t => t.id === taskId)?.coin ?? 3;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function monthStr(date: string) {
  return date.slice(0, 7);
}

function recalcDerived(history: DayRecord[]) {
  const today = todayStr();
  let streak = 0;
  let checkDate = today;
  for (let i = 0; i < 365; i++) {
    const rec = history.find(d => d.date === checkDate);
    if (rec?.allDone) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().slice(0, 10);
    } else break;
  }
  const currentMonth = monthStr(today);
  const monthlyDays = history.filter(d => d.allDone && monthStr(d.date) === currentMonth).length;
  const totalXal = history.reduce(
    (sum, d) => sum + d.completedTasks.reduce((s, t) => s + getTaskXal(t.taskId), 0),
    0,
  );
  const earnedCoins = history.reduce(
    (sum, d) => sum + d.completedTasks.reduce((s, t) => s + getTaskCoin(t.taskId), 0),
    0,
  );
  return { streak, monthlyDays, totalXal, earnedCoins };
}

export const useEcoStore = create<EcoStore>()(
  persist(
    (set, get) => ({
      streak: 0,
      monthlyDays: 0,
      totalXal: 0,
      earnedCoins: 0,
      spentCoins: 0,
      history: [],
      redeemedPrizes: [],
      synced: false,
      dailyAssignment: null,

      coinBalance: () => get().earnedCoins - get().spentCoins,

      getDay: (date) => get().history.find(d => d.date === date),

      completeTask: (date, taskId, photoDataUrl, totalDailyTasks = 5) => {
        set((state) => {
          const existingIndex = state.history.findIndex(d => d.date === date);
          let updatedHistory = [...state.history];
          let day: DayRecord;

          if (existingIndex >= 0) {
            day = { ...updatedHistory[existingIndex] };
            if (day.completedTasks.find(t => t.taskId === taskId)) return state;
            day = { ...day, completedTasks: [...day.completedTasks, { taskId, completedAt: new Date().toISOString(), photoDataUrl }] };
          } else {
            day = { date, completedTasks: [{ taskId, completedAt: new Date().toISOString(), photoDataUrl }], allDone: false };
          }
          day.allDone = day.completedTasks.length >= totalDailyTasks;

          if (existingIndex >= 0) updatedHistory[existingIndex] = day;
          else updatedHistory = [...updatedHistory, day];

          const derived = recalcDerived(updatedHistory);
          api.tasks.complete(date, taskId, new Date().toISOString()).catch(console.error);
          return { history: updatedHistory, ...derived };
        });
      },

      redeemPrize: (prizeId) => {
        set(state => ({ redeemedPrizes: [...state.redeemedPrizes, prizeId] }));
        api.prizes.redeem(prizeId).catch(console.error);
      },

      getDailyAssignment: (date, userId) => {
        const current = get().dailyAssignment;
        if (current && current.date === date) return current.ids;
        const ids = getDailyTasks(date, userId).map(t => t.id);
        set({ dailyAssignment: { date, ids } });
        return ids;
      },

      spendCoins: (amount) => {
        const balance = get().earnedCoins - get().spentCoins;
        if (balance < amount) return false;
        set(state => ({ spentCoins: state.spentCoins + amount }));
        return true;
      },

      resetMonth: () => {
        set({ monthlyDays: 0, redeemedPrizes: [] });
      },

      syncWithDB: async () => {
        try {
          const [dbHistory, dbPrizes] = await Promise.all([api.tasks.history(), api.prizes.list()]);
          const localHistory = get().history;
          const assignment = get().dailyAssignment;
          const mergedHistory: DayRecord[] = dbHistory.map(dbDay => {
            const localDay = localHistory.find(d => d.date === dbDay.date);
            const taskCount = (assignment && assignment.date === dbDay.date)
              ? assignment.ids.length
              : getDailyTasks(dbDay.date).length;
            const allDone = dbDay.completedTasks.length >= taskCount;
            return {
              date: dbDay.date,
              completedTasks: dbDay.completedTasks.map(ct => {
                const localTask = localDay?.completedTasks.find(lt => lt.taskId === ct.taskId);
                return { taskId: ct.taskId, completedAt: ct.completedAt, photoDataUrl: localTask?.photoDataUrl };
              }),
              allDone,
            };
          });
          const derived = recalcDerived(mergedHistory);
          set({ history: mergedHistory, redeemedPrizes: dbPrizes, ...derived, synced: true });
        } catch (err) {
          console.error('DB sync xətası:', err);
          set({ synced: true });
        }
      },
    }),
    { name: 'eco-tasks-store' }
  )
);
