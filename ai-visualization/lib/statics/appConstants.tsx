// These values are mostly placeholders, meant to be replaced with more refined values, and potentially specialized into multiple constants or functions

import GraphSearchPage from "@/app/problems/graph-search/page"
import React from "react"

export const APP_NAME = "AI Visualizer"

export interface Problem {
    id: string,
    name: string,
    href: string,
    element: React.ReactNode
}
export const PROBLEMS : Record<string, Problem> = {
    graphsearch: {
        id: "graphsearch",
        name: "Graph Search",
        href: "/problems/graph-search",
        element: (<GraphSearchPage></GraphSearchPage>)
    },
    neuralnetworks: {
        id: "neuralnetworks",
        name: "Neural Networks",
        href: "/problems/neutral-networks",
        element: (<GraphSearchPage></GraphSearchPage>) // Change when created
    },
    geneticalgorithms: {
        id: "geneticalgorithms",
        name: "Genetic Algorithms",
        href: "/problems/genetic-algorithms",
        element: (<GraphSearchPage></GraphSearchPage>) // Change when created
    }
}