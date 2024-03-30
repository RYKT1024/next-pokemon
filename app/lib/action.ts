'use server'
 
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from 'redis'
 
export async function revalidatePokemon(id: number) {
  let path = '/pokemon/'+id.toString()
  revalidatePath(path)
  redirect(path)
}

export async function selectPokemon(id: string) {
  redirect(`/pokemon/${id}`)
}

const client = createClient()
client.connect()

export async function putMessage(key: string, msg: string) {
  await client.set(key, msg);
}

export async function getMessage(key: string) {
  const msg = await client.get(key);
  return msg;
}