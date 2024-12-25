/* eslint-disable no-case-declarations */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { Children, useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { saveAs } from 'file-saver';
import "./KnowledgeGraph.scss";
import { Button } from "../button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown";
import { getCurrentThemeColors } from '../../utils';
import { useTheme } from '../theme-provider';

/**
 * CytoscapeGraph - A reusable wrapper component for Cytoscape visualization
 * 
 * @param {Object} props
 * @param {Array} props.elements - Array of nodes and edges
 * @param {Object} props.style - Container style object (width, height)
 * @param {Array} props.stylesheet - Cytoscape stylesheet for elements
 * @param {Object} props.layout - Layout configuration object
 * @param {string} props.layout.name - Name of the layout ('grid', 'random', 'circle', 'concentric', 'breadthfirst', 'cose', etc.)
 * @param {number} props.minZoom - Minimum zoom level (default: 0.1)
 * @param {number} props.maxZoom - Maximum zoom level (default: 10)
 * @param {boolean} props.zoomingEnabled - Enable/disable zooming (default: true)
 * @param {boolean} props.userZoomingEnabled - Enable/disable user zooming (default: true)
 * @param {boolean} props.panningEnabled - Enable/disable panning (default: true)
 * @param {boolean} props.userPanningEnabled - Enable/disable user panning (default: true)
 * @param {boolean} props.boxSelectionEnabled - Enable/disable box selection (default: true)
 * @param {boolean} props.autoungrabify - Prevent nodes from being grabbed (default: false)
 * @param {boolean} props.autolock - Prevent nodes from being moved (default: false)
 * @param {boolean} props.autounselectify - Prevent elements from being unselected (default: false)
 * @param {string} props.className - Additional CSS classes
 */
const KnowledgeGraph = ({
  elements,
  style = { width: '100%', height: '100%' },
  minZoom = 0.1,
  maxZoom = 2,
  zoomingEnabled = true,
  userZoomingEnabled = true,
  panningEnabled = true,
  userPanningEnabled = true,
  boxSelectionEnabled = true,
  autoungrabify = false,
  autolock = false,
  autounselectify = false,
  className = "my-graph",
}) => {
  const cyRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const { theme } = useTheme();
  const [colors, setColors] = useState({});

  useEffect(() => {
    setColors(getCurrentThemeColors());
  }, [theme]);

  // Default stylesheet
  const defaultStylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': colors.primary,
        'label': 'data(label)',
        'text-halign': 'center',
        'text-valign': 'center',
        'color': colors["primary-foreground"],
        'font-size': 12,
        'text-wrap': 'wrap',
        'width': 'label',
        'height': 'label',
        'padding': '20px',
        'text-overflow-wrap': 'anywhere',
        'shape': 'round-rectangle',
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': "grey",
        'target-arrow-color': "grey",
        'target-arrow-shape': 'triangle',
        'label': 'data(label)',
        'font-size': 14,
        'color': colors.primary,
        'curve-style': 'bezier',
      }
    },
    {
      selector: 'node.hover',
      style: {
        'font-size': 14,
        'border-width': 3,
        'border-color': colors.primary,
      }
    },
    {
      selector: 'edge.hover',
      style: {
        'width': 4,
        'line-color': colors.primary,
        'target-arrow-color': colors.primary,
      }
    },
  ];

  const defaultLayout = {
    name: 'concentric',
    idealEdgeLength: 100,
    nodeOverlap: 20,
    refresh: 20,
    fit: true,
    padding: 30,
    randomize: false,
    componentSpacing: 100,
    nodeRepulsion: 400000,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0
  };

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    // Node hover event
    cy.on('mouseover', 'node', (event) => {
      const node = event.target;
      node.addClass('hover');
      const nodeData = node.data();

      // Position tooltip
      const renderedPosition = node.renderedPosition();
      setTooltip({
        type: 'node',
        data: nodeData,
        x: renderedPosition.x,
        y: renderedPosition.y
      });
    });

    // Edge hover event
    cy.on('mouseover', 'edge', (event) => {
      const edge = event.target;
      edge.addClass('hover');
      const edgeData = edge.data();

      // Position tooltip
      const midpoint = edge.midpoint();
      setTooltip({
        type: 'edge',
        data: edgeData,
        x: midpoint.x,
        y: midpoint.y
      });
    });

    // Remove tooltip and hover class on mouseout
    cy.on('mouseout', 'node', (event) => {
      event.target.removeClass('hover');
      setTooltip(null);
    });

    cy.on('mouseout', 'edge', (event) => {
      event.target.removeClass('hover');
      setTooltip(null);
    });

    cy.on('click', 'node', (event) => {
      const nodeData = event.target.data();
      const name = nodeData.label;
      const label = nodeData.group;
      const url = nodeData.url;
      if (name && label) {
        window.open(`/node/${label}/${name}`, '_blank');
      } else if (url) {
        window.open(url, '_blank');
      }
    });

    // Cleanup
    return () => {
      cy.off('mouseover mouseout click');
    };
  }, [cyRef.current]);

  // Export functions
  const exportGraph = (format) => {
    if (!cyRef.current) return;

    switch (format) {
      case 'png':
        const png = cyRef.current.png({ full: true, scale: 2 });
        saveAs(png, 'graph.png');
        break;
      case 'jpg':
        const jpg = cyRef.current.jpg({ full: true, scale: 2 });
        saveAs(jpg, 'graph.jpg');
        break;
      case 'json':
        const json = JSON.stringify(cyRef.current.json());
        const blob = new Blob([json], { type: 'application/json' });
        saveAs(blob, 'graph.json');
        break;
    }
  };

  // Add a new function to determine tooltip position
  const calculateTooltipPosition = (x, y) => {
    if (!cyRef.current) return { left: x, top: y };

    const containerRect = cyRef.current.container().getBoundingClientRect();
    const tooltipWidth = 300;
    const tooltipHeight = tooltip?.type === 'edge' ? 80 : 150;
    const padding = 10;

    // Initialize position
    let left = x;
    let top = y;
    let transform = '';

    // Horizontal positioning
    if (x - tooltipWidth / 2 < padding) {
      // Too close to left edge
      left = padding;
      transform = 'translate(0, -50%)';
    } else if (x + tooltipWidth / 2 > containerRect.width - padding) {
      // Too close to right edge
      left = containerRect.width - padding - tooltipWidth;
      transform = 'translate(0, -50%)';
    } else {
      // Center horizontally
      left = x;
      transform = 'translate(-50%, -50%)';
    }

    // Vertical positioning
    const containerMiddle = containerRect.height / 2;
    
    if (y <= containerMiddle) {
      // Upper half - show tooltip below the point
      top = y + padding;
      transform = transform.replace('-50%)', '0%)');
    } else {
      // Lower half - show tooltip above the point
      top = y - tooltipHeight - padding;
      transform = transform.replace('-50%)', '-100%)');
    }

    // Final boundary checks
    if (top < padding) {
      top = padding;
    } else if (top + tooltipHeight > containerRect.height - padding) {
      top = containerRect.height - tooltipHeight - padding;
    }

    return {
      left,
      top,
      transform
    };
  };

  return (
    <div className={`knowledge-graph ${className || ''}`}>
      <div className="cytoscape-controls">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Export</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => exportGraph('png')}>
                <span>PNG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportGraph('jpg')}>
                <span>JPG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportGraph('json')}>
                <span>JSON</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Tooltip Rendering */}
      {tooltip && (
        <div
          className="cytoscape-tooltip"
          data-type={tooltip.type}
          style={{
            position: 'absolute',
            ...calculateTooltipPosition(tooltip.x, tooltip.y),
          }}
        >
          {tooltip.type === 'node' && (
            <>
              <span>{tooltip.data.label}</span>
              <pre>{tooltip.data.description}</pre>
            </>
          )}
          {tooltip.type === 'edge' && (
            <pre>{tooltip.data.source} - {tooltip.data.label} - {tooltip.data.target}</pre>
          )}
        </div>
      )}

      <CytoscapeComponent
        elements={elements}
        style={style}
        stylesheet={defaultStylesheet}
        layout={defaultLayout}
        cy={(cy) => { cyRef.current = cy; }}
        minZoom={minZoom}
        maxZoom={maxZoom}
        zoomingEnabled={zoomingEnabled}
        userZoomingEnabled={userZoomingEnabled}
        panningEnabled={panningEnabled}
        userPanningEnabled={userPanningEnabled}
        boxSelectionEnabled={boxSelectionEnabled}
        autoungrabify={autoungrabify}
        autolock={autolock}
        autounselectify={autounselectify}
      />
    </div>
  );
};

export default KnowledgeGraph;
