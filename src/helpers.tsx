// external
import React from 'react';

// internal

export const secureLink = (href: string, text: string, target: string = "_blank") => {
  return <a href={href} target={target} rel="noopener noreferrer">{text}</a>;
}

// todo: choose some nice colours here
const colors = [
  '#cc9e66',
  '#468c6d',
  '#a3b7d9',
  '#998426',
  '#36d9bb',
  '#b9a3d9',
  '#cbd936',
  '#6cd0d9',
  '#8733cc',
  '#c6d9a3',
  '#23678c',
  '#6d468c',
  '#33cc5e',
  '#2d60b3',
]

// returns one of 14 distinct colours
export const getNewColor = (i: number) => {
  if (i > colors.length) {
    throw new Error(`Only ${colors.length} colors have been defined`);
  }
  return colors[i]
}