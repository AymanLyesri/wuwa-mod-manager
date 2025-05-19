// hooks/useLoading.ts

import { hideLoading, showLoading } from "../utils/loadingControls";

export function useAsyncLoadingHook() {

    const loadingHook = async <T,>(fn: () => Promise<T>): Promise<T> => {
        try {
            showLoading();
            return await fn();
        } finally {
            hideLoading();
        }
    };

    return { loadingHook };
}