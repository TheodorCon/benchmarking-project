#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <vector>
#include <iostream>
#include <algorithm>

struct fib_result
{
    int index;
    int value;
};

std::vector<fib_result> *initial_table = new std::vector<fib_result>{{0, 0}, {1, 1}};

int memoFib(int n, std::vector<fib_result> *table = initial_table)
{
    auto result = std::find_if(table->begin(), table->end(), [&n](fib_result res) { return res.index == n; });
    if (result != table->end())
    {
        return (*result).value;
    }
    auto new_result = memoFib(n - 1, table) + memoFib(n - 2, table);
    table->push_back({n, new_result});
    return new_result;
}

int normalFib(int n)
{
    return n < 2 ? n : normalFib(n - 1) + normalFib(n - 2);
}

int tailFib(int n, int x = 0, int y = 1)
{
    return n == 0 ? x : tailFib(n - 1, y, x + y);
}

std::ostream &operator<<(std::ostream &os, const std::vector<fib_result> &fib_res_vect)
{
    for (auto &&result : fib_res_vect)
    {
        os << result.index << ": " << result.value << '\n';
    }
    return os;
}

int main(int argc, char const *argv[])
{
    int number = atoi(argv[1]);
    char str[256];
    if (strcmp(argv[2], "tail") == 0)
        sprintf(str, "%d", tailFib(number));
    else if (strcmp(argv[2], "norm") == 0)
        sprintf(str, "%d", normalFib(number));
    else if (strcmp(argv[2], "memo") == 0)
    {
        sprintf(str, "%d", memoFib(number));
    }
    printf("%s", str);
    printf("\n");
    return 0;
}