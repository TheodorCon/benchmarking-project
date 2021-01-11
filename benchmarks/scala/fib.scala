object fib {

  def normalFib(n: Int): Int =
    if (n <= 1)
      n
    else
      normalFib(n - 1) + normalFib(n - 2)

  def tailFib(n: Int): Int = {
    def fibHelper(number: Int, x: Int, y: Int): Int = {
      if (number == 0)
        x
      else
        fibHelper(number - 1, y, x + y)
    }
    fibHelper(n, 0, 1)
  }

  def main(args: Array[String]): Unit = {
    val number = args(0).toInt
    if (args.length > 1)
      if (args(1) == "tail")
        println(tailFib(number))
      else if (args(1) == "norm")
        println(normalFib(number))
      else
        println("Invalid arguments: wrong fib type")
    else
      println("Invalid arguments: no fib type")
  }
}
