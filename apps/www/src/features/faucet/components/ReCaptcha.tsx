import { useAppDispatch, useAppSelector } from "@0xflick/app-store";
import { FC, useRef, useCallback, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export const ReCaptcha: FC<{
  handleRecaptchaChange: (value: string | null) => void;
  txHash?: string;
}> = ({ handleRecaptchaChange, txHash }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  useEffect(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, [txHash]);

  const onReCAPTCHAChange = useCallback(
    (value: string | null) => {
      handleRecaptchaChange(value);
      recaptchaRef.current?.reset();
    },
    [handleRecaptchaChange]
  );

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      size="normal"
      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE ?? ""}
      onChange={onReCAPTCHAChange}
    />
  );
};
