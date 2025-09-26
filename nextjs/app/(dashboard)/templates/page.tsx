import React from 'react'

type Template = {
    name: string
    description: string
}

export default async function TemplatesPage() {
const templatePromise = new Promise<Template[]>((resolve) => {
    setTimeout(() => {
        resolve([
            {name: 'Template 1', description: 'Description 1'},
            {name: 'Template 2', description: 'Description 2'},
            {name: 'Template 3', description: 'Description 3'},
        ])
    }, 5000)
})

const templates = await templatePromise;

return (
    <div>
        <h1>Templates</h1>
        {templates.map((template, idx) => (
            <div key={idx}>{template.name}</div> 
        ))}
    </div>
  )
}