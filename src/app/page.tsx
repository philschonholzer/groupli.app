import { Button } from '@/components/ui/button'
import { newGroup } from './action'

export const runtime = 'edge'
export default function Home() {
	return (
		<form action={newGroup}>
			<Button type="submit">Say hi</Button>
		</form>
	)
}
