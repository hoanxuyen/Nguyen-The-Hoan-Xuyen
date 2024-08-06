# Messy React

## Original

```js
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (lhsPriority > -99) {
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};
```

## Isues

1. Type safety
   You should avoid using `any` as type. `blockchain` can be `string` here.

```js
const getPriority = (blockchain: any): number => {
  // blockchain: string

  switch (blockchain) {
    case "Osmosis":
      return 100;
    case "Ethereum":
      return 50;
    case "Arbitrum":
      return 30;
    case "Zilliqa":
      return 20;
    case "Neo":
      return 20;
    default:
      return -99;
  }
};
```

2. Unused dependency in useMemo.
   The `prices` dependency is not being used, should remove it to avoid unnecessary recalculations.

3. Undefined `lhsPriority` in the filter function.
   The variable `lhsPriority` is used but not defined. Should use BalancePriority instead.

4. Missing interface.
   `blockchain` field is missing from `WalletBalance` interface.

5. Duplicate interface
   `WalletBalance` and `FormattedWalletBalance` is almost identical, it should be extends from one to another.

6. `sort()` function missing condition `a = b`.
   You have created two scenarios if the rightPriority was greater than or less than leftPriority. It's would be best if you use `rightPriority - leftPriority` to get the sorting order.
   ```js
   const sortedBalances = useMemo(() => {
     return balances
       .filter((balance: WalletBalance) => {
         const balancePriority = getPriority(balance.blockchain);
         if (lhsPriority > -99) {
           if (balance.amount <= 0) {
             return true;
           }
         }
         return false;
       })
       .sort((lhs: WalletBalance, rhs: WalletBalance) => {
         const leftPriority = getPriority(lhs.blockchain);
         const rightPriority = getPriority(rhs.blockchain);
         if (leftPriority > rightPriority) {
           return -1;
         } else if (rightPriority > leftPriority) {
           return 1;
         }
       });
   }, [balances, prices]);
   ```

```js
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  return {
    ...balance,
    formatted: balance.amount.toFixed(),
  };
});
```

The `sortedBalances` is mapped to `formattedBalances` but not used.

7. Formatting `amount` correctly.
   Use a proper formatting method, such as `toFixed(2)`, for better numerical representation. If you use `toFixed()`, it just rounded up number.

## Refactored

```js
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}
interface FormattedWalletBalance extends WalletBallance {
  formatted: string;
}
interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: string): number => {
    const prioritiesList: { [key: string]: number } = {
      Osmosis: 100,
      Ethereum: 50,
      Arbitrum: 30,
      Zilliqa: 20,
      Neo: 20,
    };
    return prioritiesList[blockchain] ?? -99;
  };
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount <= 0;
        // filter balances that have priority greater than 99 and negative balance. I thinks the balance amount should be positive.
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        // sorting in descending order
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      })
      .map((balance: WalletBalance) => {
        return {
          ...balance,
          formatted: balance.amount.toFixed(2), // I don't know what is the format for this number , i assume that it should show two more decimal
        };
      });
    // Putting formattedBalances within this scope to recalculate when balances change
  }, [balances]);

  return (
    <div {...rest}>
      {sortedBalances.map((balance: FormattedWalletBalance) => {
        // Originally should be formattedBalances instead of sortedBalances, but if the formattedBallances not put in useMemo it will not get updated
        const usdValue = prices[balance.currency] * balance.amount;
        return (
          <WalletRow // import WalletRow
            className={classes.row}
            key={balance.currency} // key should be a unique string, it is not recommend to use indexes
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      })}
      {children} {/**allows any child components or elements passed to WalletPage to be rendered within the div. */}
    </div>
  );
};
```
