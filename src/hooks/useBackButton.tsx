import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useTelegramBackButton = (
  redirectPath: string,
  backState = {},
  isNoHide = false
) => {
  const tg = Telegram.WebApp;

  const navigate = useNavigate();

  useEffect(() => {
    if (tg) {
      const handleBackButtonClick = () => {
        navigate(redirectPath, backState);
      };

      tg.BackButton.show();
      tg.BackButton.onClick(handleBackButtonClick);

      return () => {
        tg.BackButton.offClick(handleBackButtonClick);
        if (!isNoHide) tg.BackButton.hide();
      };
    }
  }, [tg]);
};

export default useTelegramBackButton;
