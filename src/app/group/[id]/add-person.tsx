import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addPerson } from './action'

export default function AddPerson(props: { groupId: string }) {
	return (
		<form
			action={async (formData: FormData) => {
				'use server'
				await addPerson(
					(formData.get('name') as string) ?? 'empty',
					props.groupId,
				)
			}}
		>
			<Label htmlFor="add-person">Name</Label>
			<div className="flex gap-4">
				<Input
					id="add-person"
					className=""
					type="text"
					name="name"
					placeholder='e.g. "Alice"'
					defaultValue={''}
				/>
				<Button variant="secondary" type="submit">
					Add Person
				</Button>
			</div>
		</form>
	)
}
