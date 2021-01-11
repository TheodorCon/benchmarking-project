// Learn more about F# at http://fsharp.org

open System
open System.Collections.Generic

let tailFib n = 
    let rec fibHelper = fun n x y ->  
        match n with
        | 0 -> x
        | _ -> fibHelper (n - 1) y (x + y)
    fibHelper n 0 1

let normalFib n = 
    let rec fibHelper = fun n ->  
        match n with
        | 0 -> 0
        | 1 -> 1
        | _ -> fibHelper (n - 1) + fibHelper (n - 2)
    fibHelper n


// code taken from http://www.fssnip.net/8P/title/Memoization-for-dynamic-programming
let memoize f =    
    // Create (mutable) cache that is used for storing results of 
    // for function arguments that were already calculated.
    let cache = new Dictionary<_, _>()
    (fun x ->
        // The returned function first performs a cache lookup
        let succ, v = cache.TryGetValue(x)
        if succ then v else 
          // If value was not found, calculate & cache it
          let v = f(x) 
          cache.Add(x, v)
          v)

// code taken from http://www.fssnip.net/8P/title/Memoization-for-dynamic-programming
// Recursive function that implements Fibonacci using memoization.
/// Recursive calls are made to the memoized function, so previously
/// calculated values are retrieved from the cache.
let rec memoFib = memoize (fun n ->
  if n <= 1 then n else
  (memoFib (n - 1)) + (memoFib (n - 2)))

// Note - add #nowarn "40" to disable warning complaining about recursive
// value reference. This is not an issue in this snippet.

[<EntryPoint>]
let main argv =
    match argv with
    | [|number; "tail"|] -> printfn "%s" (sprintf "%i" (tailFib (number |> int)))
    | [|number; "norm"|] -> printfn "%s" (sprintf "%i" (normalFib (number |> int)))
    | [|number; "memo"|] -> printfn "%s" (sprintf "%i" (memoFib (number |> int)))
    | _            -> printfn "no arguments"
    0 
