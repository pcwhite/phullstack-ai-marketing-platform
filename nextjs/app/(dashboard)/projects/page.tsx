import React from 'react'

type Project = {
    name: string
    description: string
}

export default async function ProjectsPage() {
const projectPromise = new Promise<Project[]>((resolve) => {
    setTimeout(() => {
        resolve([
            {name: 'Project 1', description: 'Description 1'},
            {name: 'Project 2', description: 'Description 2'},
            {name: 'Project 3', description: 'Description 3'},
        ])
    }, 5000)
})

const projects = await projectPromise;

return (
    <div>
        <h1>Projects</h1>
        {projects.map((project, idx) => (
            <div key={idx}>{project.name}</div> 
        ))}
    </div>
  )
}
