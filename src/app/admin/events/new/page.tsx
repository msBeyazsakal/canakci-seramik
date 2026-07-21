import EventForm from "../EventForm"

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Yeni Etkinlik</h1>
      <EventForm />
    </div>
  )
}
