import React, { useState, useCallback } from 'react';
import type { MindentityParams, Mode, AnimationOptions } from '../types.js';
import { defaults } from '../core/generation.js';

export interface MindentityControllerProps {
  params: MindentityParams;
  onChange: (params: MindentityParams) => void;
  onGenerate?: () => void;
  onDownloadSVG?: () => void;
  onDownloadPNG?: () => void;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export const MindentityController: React.FC<MindentityControllerProps> = ({
  params,
  onChange,
  onGenerate,
  onDownloadSVG,
  onDownloadPNG,
  className,
  style,
  compact = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'colors'])
  );

  const updateParam = useCallback(<K extends keyof MindentityParams>(
    key: K,
    value: MindentityParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  }, [params, onChange]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const handleArrayChange = useCallback((
    key: 'offsetsRows' | 'offsetsCols',
    index: number,
    value: number
  ) => {
    const currentArray = params[key] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    updateParam(key, newArray);
  }, [params, updateParam]);

  const controlStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: compact ? '12px' : '16px',
    backgroundColor: '#ffffff',
    maxWidth: compact ? '300px' : '400px',
    ...style
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: compact ? '12px' : '16px',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: compact ? '8px' : '12px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontWeight: '500',
    color: '#333'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginRight: '8px',
    marginBottom: '8px'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#0066cc',
    color: 'white'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f0f0f0',
    color: '#333'
  };

  const SectionHeader: React.FC<{ title: string; section: string }> = ({ title, section }) => (
    <h3
      style={{
        margin: '0 0 8px 0',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        color: '#333'
      }}
      onClick={() => toggleSection(section)}
    >
      <span style={{ marginRight: '8px' }}>
        {expandedSections.has(section) ? '▼' : '▶'}
      </span>
      {title}
    </h3>
  );

  const NumberInput: React.FC<{
    label: string;
    value: number | undefined;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
  }> = ({ label, value, onChange, min, max, step = 1 }) => (
    <div style={{ marginBottom: '8px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        style={inputStyle}
      />
    </div>
  );

  const TextInput: React.FC<{
    label: string;
    value: string | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
  }> = ({ label, value, onChange, placeholder }) => (
    <div style={{ marginBottom: '8px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );

  const ColorInput: React.FC<{
    label: string;
    value: string | undefined;
    onChange: (value: string) => void;
  }> = ({ label, value, onChange }) => (
    <div style={{ marginBottom: '8px' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="color"
          value={value ?? '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px' }}
        />
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>
    </div>
  );

  const SelectInput: React.FC<{
    label: string;
    value: string | undefined;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }> = ({ label, value, onChange, options }) => (
    <div style={{ marginBottom: '8px' }}>
      <label style={labelStyle}>{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const CheckboxInput: React.FC<{
    label: string;
    checked: boolean | undefined;
    onChange: (checked: boolean) => void;
  }> = ({ label, checked, onChange }) => (
    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
      <input
        type="checkbox"
        checked={checked ?? false}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginRight: '8px' }}
      />
      <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
    </div>
  );

  return (
    <div className={className} style={controlStyle}>
      <div style={sectionStyle}>
        <SectionHeader title="Basic Settings" section="basic" />
        {expandedSections.has('basic') && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <NumberInput
                label="Width"
                value={params.width}
                onChange={(value) => updateParam('width', value)}
                min={100}
                max={2048}
              />
              <NumberInput
                label="Height"
                value={params.height}
                onChange={(value) => updateParam('height', value)}
                min={100}
                max={2048}
              />
            </div>
            <NumberInput
              label="Grid Size"
              value={params.gridSize}
              onChange={(value) => updateParam('gridSize', value)}
              min={2}
              max={20}
            />
            <SelectInput
              label="Mode"
              value={params.mode}
              onChange={(value) => updateParam('mode', value as Mode)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'letter', label: 'Letter' },
                { value: 'string', label: 'String' }
              ]}
            />
            {(params.mode === 'letter' || params.mode === 'string') && (
              <TextInput
                label="Input"
                value={params.input}
                onChange={(value) => updateParam('input', value)}
                placeholder={params.mode === 'letter' ? 'A' : 'Mindnow'}
              />
            )}
            <TextInput
              label="Seed"
              value={typeof params.seed === 'string' ? params.seed : params.seed?.toString()}
              onChange={(value) => updateParam('seed', value)}
              placeholder="Random seed"
            />
          </>
        )}
      </div>

      <div style={sectionStyle}>
        <SectionHeader title="Colors" section="colors" />
        {expandedSections.has('colors') && (
          <>
            <ColorInput
              label="Background Color"
              value={params.backgroundColor}
              onChange={(value) => updateParam('backgroundColor', value)}
            />
            <ColorInput
              label="Foreground Color"
              value={params.foregroundColor}
              onChange={(value) => updateParam('foregroundColor', value)}
            />
            <CheckboxInput
              label="Transparent Background"
              checked={params.transparent}
              onChange={(checked) => updateParam('transparent', checked)}
            />
          </>
        )}
      </div>

      <div style={sectionStyle}>
        <SectionHeader title="Layout" section="layout" />
        {expandedSections.has('layout') && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <NumberInput
                label="Gap"
                value={params.gap}
                onChange={(value) => updateParam('gap', value)}
                min={0}
                max={50}
              />
              <NumberInput
                label="Margin"
                value={params.margin}
                onChange={(value) => updateParam('margin', value)}
                min={0}
                max={100}
              />
            </div>
            <NumberInput
              label="White Space %"
              value={params.whiteSpace}
              onChange={(value) => updateParam('whiteSpace', value)}
              min={0}
              max={100}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <NumberInput
                label="Offset X"
                value={params.offsetX}
                onChange={(value) => updateParam('offsetX', value)}
                min={-10}
                max={10}
              />
              <NumberInput
                label="Offset Y"
                value={params.offsetY}
                onChange={(value) => updateParam('offsetY', value)}
                min={-10}
                max={10}
              />
            </div>
          </>
        )}
      </div>

      <div style={sectionStyle}>
        <SectionHeader title="Shapes" section="shapes" />
        {expandedSections.has('shapes') && (
          <>
            <NumberInput
              label="Half Shapes Chance %"
              value={params.halfShapesChance}
              onChange={(value) => updateParam('halfShapesChance', value)}
              min={0}
              max={100}
            />
            <NumberInput
              label="Node Shapes Chance %"
              value={params.nodeShapesChance}
              onChange={(value) => updateParam('nodeShapesChance', value)}
              min={0}
              max={100}
            />
            <NumberInput
              label="Square Radius %"
              value={params.squareRadius}
              onChange={(value) => updateParam('squareRadius', value)}
              min={0}
              max={50}
            />
            <NumberInput
              label="Cross Radius %"
              value={params.crossRadius}
              onChange={(value) => updateParam('crossRadius', value)}
              min={0}
              max={50}
            />
            <NumberInput
              label="Circle Radius %"
              value={params.circleRadius}
              onChange={(value) => updateParam('circleRadius', value)}
              min={0}
              max={50}
            />
          </>
        )}
      </div>

      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
        <button
          onClick={onGenerate}
          style={primaryButtonStyle}
        >
          Generate
        </button>
        <button
          onClick={onDownloadSVG}
          style={secondaryButtonStyle}
        >
          Download SVG
        </button>
        <button
          onClick={onDownloadPNG}
          style={secondaryButtonStyle}
        >
          Download PNG
        </button>
      </div>
    </div>
  );
};
