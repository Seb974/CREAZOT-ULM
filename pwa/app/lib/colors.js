import { isDefined } from "./utils";

export const colors = [
    { id: '#f87171', name: 'Red' }, 
    { id: '#fb923c', name: 'Orange' },
    { id: '#fbbf24', name: 'Amber' },
    { id: '#facc15', name: 'Yellow' },
    { id: '#a3e635', name: 'Lime' },
    { id: '#4ade80', name: 'Green' },
    { id: '#34d399', name: 'Emerald' },
    { id: '#2dd4bf', name: 'Teal' },
    { id: '#22d3ee', name: 'Cyan' },
    { id: '#38bdf8', name: 'Sky' },
    { id: '#60a5fa', name: 'Blue' },
    { id: '#818cf8', name: 'Indigo' },
    { id: '#a78bfa', name: 'Violet' },
    { id: '#c084fc', name: 'Purple' },
    { id: '#e879f9', name: 'Fuchsia' },
    { id: '#f472b6', name: 'Pink' },
    { id: '#fb7185', name: 'Rose' },
    { id: '#94a3b8', name: 'Slate' },
    { id: '#9ca3af', name: 'Gray' },
    { id: '#a1a1aa', name: 'Zinc' },
    { id: '#a3a3a3', name: 'Neutral' },
    { id: '#a8a29e', name: 'Stone' },
  ];

  export const getColor = color => {
      const defaultColor = colors.find(c => c.name.toUpperCase() === "GRAY");
      const selection = colors.find(c => c.id === color);
      return isDefined(selection) ? selection : defaultColor;
  };