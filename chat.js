async function message(sender, receiver) 
{
let results = await fetch('http://localhost:3000/managers/1');
let sender = await results.json();

let result = await fetch('http://localhost:3000/managers/2');
let receiver = await result.json();






}