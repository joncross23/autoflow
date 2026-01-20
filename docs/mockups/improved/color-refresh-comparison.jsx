/**
 * AutoFlow Color Refresh Mockup
 *
 * Demonstrates proposed changes to:
 * 1. Remove purple/indigo tones
 * 2. Add modern, friendly accent colors
 * 3. Reduce excessive transparency for better clarity
 *
 * Compare CURRENT vs PROPOSED side-by-side
 */

import React, { useState } from 'react';

const ColorRefreshComparison = () => {
  const [view, setView] = useState('palettes'); // 'palettes', 'cards', 'interactive'

  // Current color palette
  const currentAccents = [
    { name: 'Cyan', color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' },
    { name: 'Blue', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' },
    { name: 'Indigo', color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', remove: true },
    { name: 'Emerald', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
    { name: 'Amber', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', remove: true },
    { name: 'Rose', color: '#F43F5E', gradient: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)' },
  ];

  // Proposed color palette
  const proposedAccents = [
    { name: 'Cyan', color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', status: 'keep' },
    { name: 'Sky', color: '#38BDF8', gradient: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)', status: 'new' },
    { name: 'Teal', color: '#14B8A6', gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', status: 'new' },
    { name: 'Emerald', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', status: 'keep' },
    { name: 'Coral', color: '#FB923C', gradient: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)', status: 'new' },
    { name: 'Rose', color: '#F43F5E', gradient: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)', status: 'keep' },
  ];

  const PaletteView = () => (
    <div className="grid grid-cols-2 gap-8">
      {/* CURRENT */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">Current Palette</h3>
          <p className="text-gray-400 text-sm">Includes purple tones (indigo) that feel dated</p>
        </div>
        <div className="space-y-4">
          {currentAccents.map((accent) => (
            <div key={accent.name} className="relative">
              <div
                className="h-24 rounded-lg p-4 flex items-end"
                style={{ background: accent.gradient }}
              >
                <div>
                  <div className="text-white font-semibold text-lg">{accent.name}</div>
                  <div className="text-white/80 text-sm font-mono">{accent.color}</div>
                </div>
              </div>
              {accent.remove && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Remove
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PROPOSED */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">Proposed Palette</h3>
          <p className="text-gray-400 text-sm">Fresh, modern colors with friendly vibes</p>
        </div>
        <div className="space-y-4">
          {proposedAccents.map((accent) => (
            <div key={accent.name} className="relative">
              <div
                className="h-24 rounded-lg p-4 flex items-end"
                style={{ background: accent.gradient }}
              >
                <div>
                  <div className="text-white font-semibold text-lg">{accent.name}</div>
                  <div className="text-white/80 text-sm font-mono">{accent.color}</div>
                </div>
              </div>
              {accent.status === 'new' && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                  New
                </div>
              )}
              {accent.status === 'keep' && (
                <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded">
                  Keep
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CardsView = () => (
    <div className="space-y-8">
      {/* Transparency Comparison */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Card Background Opacity</h3>
        <div className="grid grid-cols-2 gap-8">
          {/* CURRENT - 70% opacity */}
          <div>
            <div className="mb-3">
              <span className="text-gray-400 text-sm">Current: 70% opacity</span>
              <span className="text-yellow-400 text-xs ml-2">(too transparent)</span>
            </div>
            <div
              className="rounded-lg border p-6"
              style={{
                backgroundColor: 'rgba(31, 31, 38, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.06)'
              }}
            >
              <h4 className="text-white font-semibold mb-2">Automation Idea</h4>
              <p className="text-gray-300 text-sm mb-4">
                This card feels ghostly and lacks presence. Text is harder to read against the transparent background.
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded text-sm text-white"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  Hover me
                </button>
                <button
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: '#6366F1',
                    color: 'white'
                  }}
                >
                  Indigo Action
                </button>
              </div>
            </div>
          </div>

          {/* PROPOSED - 85% opacity */}
          <div>
            <div className="mb-3">
              <span className="text-gray-400 text-sm">Proposed: 85% opacity</span>
              <span className="text-emerald-400 text-xs ml-2">(more solid)</span>
            </div>
            <div
              className="rounded-lg border p-6"
              style={{
                backgroundColor: 'rgba(31, 31, 38, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.10)'
              }}
            >
              <h4 className="text-white font-semibold mb-2">Automation Idea</h4>
              <p className="text-gray-300 text-sm mb-4">
                This card feels more confident and grounded. Text is clearer and easier to read. Notice the more visible border too.
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded text-sm text-white transition-colors"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  Hover me
                </button>
                <button
                  className="px-4 py-2 rounded text-sm"
                  style={{
                    backgroundColor: '#14B8A6',
                    color: 'white'
                  }}
                >
                  Teal Action
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Border Comparison */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Border Visibility</h3>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="mb-3">
              <span className="text-gray-400 text-sm">Current: 6% opacity</span>
              <span className="text-yellow-400 text-xs ml-2">(barely visible)</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded"
                  style={{
                    backgroundColor: 'rgba(31, 31, 38, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div className="text-white text-sm">Card {i}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3">
              <span className="text-gray-400 text-sm">Proposed: 10% opacity</span>
              <span className="text-emerald-400 text-xs ml-2">(clear definition)</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded"
                  style={{
                    backgroundColor: 'rgba(31, 31, 38, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.10)'
                  }}
                >
                  <div className="text-white text-sm">Card {i}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const InteractiveView = () => {
    const [hoveredCurrent, setHoveredCurrent] = useState(null);
    const [hoveredProposed, setHoveredProposed] = useState(null);
    const [selectedCurrent, setSelectedCurrent] = useState(1);
    const [selectedProposed, setSelectedProposed] = useState(1);

    return (
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-white mb-6">Interactive States</h3>

        {/* Hover States */}
        <div>
          <h4 className="text-white font-medium mb-4">Hover Effects</h4>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="mb-3">
                <span className="text-gray-400 text-sm">Current: 10% hover</span>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded cursor-pointer transition-colors"
                    style={{
                      backgroundColor: hoveredCurrent === i
                        ? 'rgba(255, 255, 255, 0.10)'
                        : 'rgba(31, 31, 38, 0.7)',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid'
                    }}
                    onMouseEnter={() => setHoveredCurrent(i)}
                    onMouseLeave={() => setHoveredCurrent(null)}
                  >
                    <div className="text-white text-sm">Hover over item {i}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3">
                <span className="text-gray-400 text-sm">Proposed: 15% hover</span>
                <span className="text-emerald-400 text-xs ml-2">(more visible)</span>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded cursor-pointer transition-colors"
                    style={{
                      backgroundColor: hoveredProposed === i
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(31, 31, 38, 0.85)',
                      borderColor: 'rgba(255, 255, 255, 0.10)',
                      border: '1px solid'
                    }}
                    onMouseEnter={() => setHoveredProposed(i)}
                    onMouseLeave={() => setHoveredProposed(null)}
                  >
                    <div className="text-white text-sm">Hover over item {i}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected States */}
        <div>
          <h4 className="text-white font-medium mb-4">Selected States with New Colors</h4>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="mb-3">
                <span className="text-gray-400 text-sm">Current: Indigo 10%</span>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded cursor-pointer transition-colors"
                    style={{
                      backgroundColor: selectedCurrent === i
                        ? 'rgba(99, 102, 241, 0.10)'
                        : 'rgba(31, 31, 38, 0.7)',
                      borderColor: selectedCurrent === i
                        ? 'rgba(99, 102, 241, 0.30)'
                        : 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid'
                    }}
                    onClick={() => setSelectedCurrent(i)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Option {i}</span>
                      {selectedCurrent === i && (
                        <span className="text-xs" style={{ color: '#6366F1' }}>✓ Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3">
                <span className="text-gray-400 text-sm">Proposed: Teal 15%</span>
                <span className="text-emerald-400 text-xs ml-2">(clearer)</span>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded cursor-pointer transition-colors"
                    style={{
                      backgroundColor: selectedProposed === i
                        ? 'rgba(20, 184, 166, 0.15)'
                        : 'rgba(31, 31, 38, 0.85)',
                      borderColor: selectedProposed === i
                        ? 'rgba(20, 184, 166, 0.40)'
                        : 'rgba(255, 255, 255, 0.10)',
                      border: '1px solid'
                    }}
                    onClick={() => setSelectedProposed(i)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Option {i}</span>
                      {selectedProposed === i && (
                        <span className="text-xs" style={{ color: '#14B8A6' }}>✓ Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Accent Button Comparison */}
        <div>
          <h4 className="text-white font-medium mb-4">Accent Buttons in Context</h4>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="mb-3">
                <span className="text-gray-400 text-sm">Current Accents</span>
              </div>
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: 'rgba(31, 31, 38, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid'
                }}
              >
                <h5 className="text-white font-medium mb-4">Process automation request</h5>
                <p className="text-gray-300 text-sm mb-4">
                  Automate the monthly reporting workflow for the sales team.
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded text-sm text-white font-medium"
                    style={{ backgroundColor: '#6366F1' }}
                  >
                    Indigo: Analyse
                  </button>
                  <button
                    className="px-4 py-2 rounded text-sm text-white font-medium"
                    style={{ backgroundColor: '#F59E0B' }}
                  >
                    Amber: Archive
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-3">
                <span className="text-gray-400 text-sm">Proposed Accents</span>
                <span className="text-emerald-400 text-xs ml-2">(fresher)</span>
              </div>
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: 'rgba(31, 31, 38, 0.85)',
                  borderColor: 'rgba(255, 255, 255, 0.10)',
                  border: '1px solid'
                }}
              >
                <h5 className="text-white font-medium mb-4">Process automation request</h5>
                <p className="text-gray-300 text-sm mb-4">
                  Automate the monthly reporting workflow for the sales team.
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded text-sm text-white font-medium"
                    style={{ backgroundColor: '#14B8A6' }}
                  >
                    Teal: Analyse
                  </button>
                  <button
                    className="px-4 py-2 rounded text-sm text-white font-medium"
                    style={{ backgroundColor: '#FB923C' }}
                  >
                    Coral: Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0F12 0%, #1A1A24 100%)',
      padding: '48px 24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            AutoFlow Color Refresh
          </h1>
          <p className="text-gray-400">
            Removing purple tones and reducing transparency for a fresh, friendly vibe
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'palettes', label: 'Color Palettes' },
            { id: 'cards', label: 'Card Transparency' },
            { id: 'interactive', label: 'Interactive States' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className="px-4 py-2 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: view === tab.id
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: view === tab.id ? '#FFFFFF' : '#9CA3AF',
                border: '1px solid',
                borderColor: view === tab.id
                  ? 'rgba(255, 255, 255, 0.20)'
                  : 'rgba(255, 255, 255, 0.10)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {view === 'palettes' && <PaletteView />}
          {view === 'cards' && <CardsView />}
          {view === 'interactive' && <InteractiveView />}
        </div>

        {/* Summary */}
        <div
          className="mt-12 p-6 rounded-lg"
          style={{
            backgroundColor: 'rgba(20, 184, 166, 0.10)',
            border: '1px solid rgba(20, 184, 166, 0.30)'
          }}
        >
          <h3 className="text-white font-semibold mb-3">Summary of Changes</h3>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-teal-400 font-medium mb-2">Remove</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Indigo accent (#6366F1) - too similar to purple</li>
                <li>• Amber accent (#F59E0B) - can feel cautionary</li>
                <li>• All purple/violet legacy references</li>
                <li>• Excessive transparency (70% cards, 6% borders)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-medium mb-2">Add</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Teal accent (#14B8A6) - modern, sophisticated</li>
                <li>• Sky or Coral accent - light, approachable</li>
                <li>• Increased opacity (85% cards, 10% borders)</li>
                <li>• Better hover visibility (15% instead of 10%)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-6 p-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <details>
            <summary className="text-gray-400 text-sm cursor-pointer">View technical implementation details</summary>
            <div className="mt-4 text-xs text-gray-500 space-y-2">
              <p><strong>Files to modify:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>src/app/globals.css - CSS variables and theme definitions</li>
                <li>src/lib/themes/index.ts - Accent type definition</li>
                <li>src/lib/themes/definitions/autoflow.ts - AutoFlow theme</li>
                <li>src/lib/themes/presets.ts - Default theme presets</li>
                <li>src/components/theme/AppearanceSettings.tsx - Theme UI</li>
                <li>src/components/projects/TaskListView.tsx - Remove purple</li>
                <li>src/components/shared/Badge.tsx - Remove purple</li>
                <li>src/components/ui/Avatar.tsx - Remove purple</li>
              </ul>
              <p className="mt-3"><strong>Opacity changes:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Card backgrounds: 0.7 → 0.85 (+21% more solid)</li>
                <li>Borders: 0.06 → 0.10 (+67% more visible)</li>
                <li>Hover states: 0.10 → 0.15 (+50% more noticeable)</li>
                <li>Selected states: 0.10 → 0.15 (+50% clearer)</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ColorRefreshComparison;
