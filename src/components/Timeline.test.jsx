import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Timeline from './Timeline';
import { timelineData } from '../data/timelineData';

describe('Timeline Component', () => {
  it('displays all timeline stages', () => {
    render(
      <Timeline 
        exploredStages={[]} 
        setExploredStages={vi.fn()} 
        activeStageId={null} 
        setActiveStageId={vi.fn()} 
      />
    );
    
    // Check if the title is there
    expect(screen.getByText('The Election Timeline')).toBeInTheDocument();

    // Verify all stages are rendered
    timelineData.forEach(stage => {
      expect(screen.getByText(stage.title)).toBeInTheDocument();
    });
  });

  it('opens detail panel when a card is clicked', () => {
    const setActiveStageId = vi.fn();
    const setExploredStages = vi.fn();
    
    const { rerender } = render(
      <Timeline 
        exploredStages={[]} 
        setExploredStages={setExploredStages} 
        activeStageId={null} 
        setActiveStageId={setActiveStageId} 
      />
    );

    const firstStage = timelineData[0];
    const firstStageButton = screen.getByText(firstStage.title).closest('button');
    
    // Click the card
    fireEvent.click(firstStageButton);
    
    expect(setActiveStageId).toHaveBeenCalledWith(firstStage.id);
    expect(setExploredStages).toHaveBeenCalled();

    // Re-render with the new activeStageId to simulate state update from parent
    rerender(
      <Timeline 
        exploredStages={[firstStage.id]} 
        setExploredStages={setExploredStages} 
        activeStageId={firstStage.id} 
        setActiveStageId={setActiveStageId} 
      />
    );

    // The detail panel should now show the description
    expect(screen.getByText(firstStage.description)).toBeInTheDocument();
    
    // Also check for a bullet point
    if (firstStage.bulletPoints && firstStage.bulletPoints.length > 0) {
      expect(screen.getByText(firstStage.bulletPoints[0])).toBeInTheDocument();
    }
  });

  it('closes detail panel when active stage is clicked again', () => {
    const setActiveStageId = vi.fn();
    const firstStage = timelineData[0];

    render(
      <Timeline 
        exploredStages={[firstStage.id]} 
        setExploredStages={vi.fn()} 
        activeStageId={firstStage.id} 
        setActiveStageId={setActiveStageId} 
      />
    );

    const firstStageButton = screen.getByRole('button', { name: new RegExp(`Stage ${firstStage.stageNumber}: ${firstStage.title}`) });
    
    // Click the already active card
    fireEvent.click(firstStageButton);
    
    // Should be called with null to close it
    expect(setActiveStageId).toHaveBeenCalledWith(null);
  });

  it('applies stage color accents correctly', () => {
    render(
      <Timeline 
        exploredStages={[]} 
        setExploredStages={vi.fn()} 
        activeStageId={null} 
        setActiveStageId={vi.fn()} 
      />
    );

    const firstStage = timelineData[0];
    const firstStageButton = screen.getByRole('button', { name: new RegExp(`Stage ${firstStage.stageNumber}: ${firstStage.title}`) });

    // The button should have the accent color as a custom property
    expect(firstStageButton).toHaveStyle({ '--glow-color': `${firstStage.accentColor}80` });
  });
});
