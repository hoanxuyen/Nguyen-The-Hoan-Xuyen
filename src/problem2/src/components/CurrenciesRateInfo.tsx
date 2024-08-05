import { getDate } from "../AppUtil";
import { CurrencyConfig } from "../types";

type CurrenciesRateInfoProps = {
  fromCurrency: CurrencyConfig;
  toCurrency: CurrencyConfig;
};
export default function CurrenciesRateInfo({
  fromCurrency,
  toCurrency,
}: CurrenciesRateInfoProps) {
  return (
    <div className="font-bold mt-2">
      <p>
        <span>1</span> {fromCurrency.currency} =
      </p>
      <p className="text-2xl ">
        {`${fromCurrency.price / toCurrency.price} ${toCurrency.currency}`}
      </p>
      <p className="font-normal ">Updated on {getDate(fromCurrency.date)}</p>
    </div>
  );
}
