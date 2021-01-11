import System.Environment (getArgs)

main :: IO ()
main = do
  args <- getArgs
  case args of
    number : "norm" : rest -> print $ normFib (read number)
    number : "tail" : rest -> print $ tailFib (read number)
    number : "memo" : rest -> print $ memoFib (read number)
    [] -> putStrLn "You need to provide a number"
    _ -> putStrLn "Invalid arguments"

tailFib :: (Eq t1, Num t1, Num t2) => t1 -> t2
tailFib n = fibHelper n 0 1
  where
    fibHelper 0 x _ = x
    fibHelper n x y = fibHelper (n -1) y (x + y)

normFib :: (Eq a, Num a, Num p) => a -> p
normFib n = fibHelper n
  where
    fibHelper 0 = 0
    fibHelper 1 = 1
    fibHelper n = fibHelper (n - 1) + fibHelper (n - 2)

memoFib :: Int -> Integer
memoFib = (map fib [0 ..] !!)
  where
    fib 0 = 0
    fib 1 = 1
    fib n = memoFib (n -2) + memoFib (n -1)
