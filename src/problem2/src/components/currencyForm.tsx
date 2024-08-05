import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { API_BASE } from "../AppUtil";
import CurrenciesRateInfo from "./CurrenciesRateInfo";
import { CurrencyConfig } from "../types";
import NumberInput from "./NumberInput";
import DropdownButton from "./DropdownButton";
type FormValues = {
  currencyToSend: CurrencyConfig;
  currencyToReceive: CurrencyConfig;
  amountToSend: number;
  amountToReceive: number;
};

const renderInputGroup = (
  currencyList: CurrencyConfig[],
  inputName: string,
  dropdownName: string,
  placeholder: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
) => {
  return (
    <div className="sm:flex sm:gap-2 space-y-2 sm:space-y-0">
      <DropdownButton name={dropdownName} list={currencyList} />
      <NumberInput
        name={inputName}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
};

export default function CurrencyForm() {
  const [currencyList, setCurrencyList] = useState<CurrencyConfig[]>([]);
  const methods = useForm<FormValues>({
    defaultValues: {
      amountToSend: 0,
      amountToReceive: 0,
    },
    mode: "onChange",
  });
  const { setValue, watch } = methods;

  // Fetch data
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(API_BASE);
        const data: CurrencyConfig[] = await response.json();
        // Filter duplicate values
        const filteredData = Array.from(
          data
            .reduce((map, item) => map.set(item.currency, item), new Map())
            .values()
        );
        setCurrencyList(filteredData);

        // Set the default currency for currency to send and receive on load
        setValue("currencyToSend", filteredData[0]);
        setValue("currencyToReceive", filteredData[1]);
      } catch (error) {
        console.error("Failed to fetch currency data:", error);
      }
    };

    fetchCurrencies();
  }, [setValue]);

  const currencyToSend = watch("currencyToSend");
  const currencyToReceive = watch("currencyToReceive");

  const calculateAmountToReceive = (amount: number) => {
    if (currencyToSend && currencyToReceive) {
      const rate = currencyToSend.price / currencyToReceive.price;
      setValue("amountToReceive", amount * rate, { shouldValidate: true });
    }
  };

  const calculateAmountToSend = (amount: number) => {
    if (currencyToSend && currencyToReceive) {
      const rate = currencyToReceive.price / currencyToSend.price;
      setValue("amountToSend", amount * rate, { shouldValidate: true });
    }
  };

  // Watch the selected currencies and amount to send

  const amountToSend = watch("amountToSend");
  const amountToReceive = watch("amountToReceive");
  // Recalculate the amount to receive whenever the currencies or amount to send change
  useEffect(() => {
    calculateAmountToReceive(amountToSend);
  }, [currencyToSend, currencyToReceive, amountToSend]);

  const handleSwap = () => {
    if (amountToSend && currencyToSend && currencyToReceive) {
      const tempAmountToSend = amountToSend;
      const tempCurrencyToSend = currencyToSend;

      setValue("currencyToSend", currencyToReceive);
      setValue("currencyToReceive", tempCurrencyToSend);

      setValue("amountToSend", amountToReceive);
      setValue("amountToReceive", tempAmountToSend);
    }
  };

  return (
    <div className="max-w-screen-md sm:w-2/3 bg-zinc-700 rounded shadow-md p-4 text-white">
      <FormProvider {...methods}>
        <form noValidate={true} className="space-y-2">
          <div className="relative sm:flex sm:gap-2">
            <div className="space-y-12 sm:space-y-2 flex-grow">
              {renderInputGroup(
                currencyList,
                "amountToSend",
                "currencyToSend",
                "Amount to send",
                (e) => {
                  const value = parseFloat(e.target.value);
                  if (value < 0) {
                    setValue("amountToSend", 0);
                  } else {
                    calculateAmountToReceive(value);
                  }
                }
              )}
              {renderInputGroup(
                currencyList,
                "amountToReceive",
                "currencyToReceive",
                "Amount to receive",
                (e) => {
                  const value = parseFloat(e.target.value);
                  if (value < 0) {
                    setValue("amountToReceive", 0);
                  } else {
                    calculateAmountToSend(value);
                  }
                }
              )}
            </div>
            <button
              type="button"
              className="absolute sm:static left-1/2 top-[94px] -translate-x-1/2 sm:translate-x-0 basis-10 flex justify-center items-center"
              onClick={handleSwap}
            >
              <img
                src="/swap.svg"
                className="size-10 rounded-full p-2 rotate-90 bg-slate-300 transition-all bg-opacity-50 hover:bg-opacity-75"
                alt="Swap currencies"
              />
            </button>
          </div>
        </form>
      </FormProvider>
      {currencyToReceive && currencyToSend && (
        <CurrenciesRateInfo
          fromCurrency={currencyToSend}
          toCurrency={currencyToReceive}
        />
      )}
    </div>
  );
}
