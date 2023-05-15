import { Redis } from "@upstash/redis";

export const db =  new Redis({
  url: 'https://apn1-sterling-kangaroo-34202.upstash.io',
  token: 'AYWaASQgNjYzNGZmODItZGMyZC00YzIxLWEzMDEtNTQ4ZjY2YjQ2ZjY3ZDJjNGE0MTFkYzk2NDkzZjk5NmI3MmJjYTM1NzRmZTM='
});
