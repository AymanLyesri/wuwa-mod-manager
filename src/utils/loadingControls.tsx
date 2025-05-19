type LoadingControls = { show: () => void; hide: () => void };
let globalControls: LoadingControls | null = null;

export const initLoading = (controls: LoadingControls) => {
    globalControls = controls;
};

export const showLoading = () => globalControls?.show();
export const hideLoading = () => globalControls?.hide();