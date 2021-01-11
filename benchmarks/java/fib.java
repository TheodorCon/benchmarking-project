class fib
{
    public static void main(final String[] array) {
        try {
            final int int1 = Integer.parseInt(array[0]);
            if (array[1].equals("tail")) {
                System.out.println(tailFib(int1));
            }
            else {
                if (!array[1].equals("norm")) {
                    throw new Exception("Invalid arguments: bad fib type");
                }
                System.out.println(normalFib(int1));
            }
        }
        catch (Exception x) {
            System.out.println(x);
        }
    }
    
    private static int tailFib(final int n, final int n2, final int n3) {
        if (n == 0) {
            return n2;
        }
        return tailFib(n - 1, n3, n2 + n3);
    }
    
    private static int tailFib(final int n) {
        return tailFib(n, 0, 1);
    }
    
    private static int normalFib(final int n) {
        if (n == 0 || n == 1) {
            return n;
        }
        return normalFib(n - 1) + normalFib(n - 2);
    }
}