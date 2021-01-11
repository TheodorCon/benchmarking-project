using System;
using System.Collections.Generic;

namespace csharp_benchmarks_2020
{
    class Program
    {
        static void Main(string[] args)
        {
            var number = Int32.Parse(args[0]);
            if (args.Length > 1)
            {
                if (args[1] == "tail")
                    Console.WriteLine(tailFib(number));
                else if (args[1] == "norm")
                    Console.WriteLine(normalFib(number));
                else if (args[1] == "memo")
                    Console.WriteLine(memoFib(number));
                else
                    throw new Exception("invalid fib type");
            }
            else
                throw new Exception("fib type not provided");

        }

        private static int tailFib(int n)
        {
            int fibHelper(int n, int x, int y)
            {
                if (n == 0)
                    return x;
                else
                    return fibHelper(n - 1, y, x + y);
            }

            return fibHelper(n, 0, 1);
        }

        private static int normalFib(int n)
        {
            int fibHelper(int n)
            {
                if (n == 0 || n == 1)
                    return n;
                else
                    return fibHelper(n - 1) + fibHelper(n - 2);
            }
            return fibHelper(n);
        }

        private static int memoFib(int n)
        {
            Dictionary<int, int> table = new Dictionary<int, int>();
            table.Add(0, 0);
            table.Add(1, 1);

            int fibHelper(int n)
            {
                if (table.ContainsKey(n))
                    return table[n];

                int nextValue = fibHelper(n - 1) + fibHelper(n - 2);

                table.Add(n, nextValue);
                return nextValue;
            }

            return fibHelper(n);
        }
    }
}
