'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cx } from '@/shared/lib/classNames';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  isClearable?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const TYPE_AHEAD_TIMEOUT_MS = 500;

const Select = ({
  id,
  value,
  onChange,
  options,
  placeholder = '선택',
  disabled,
  isClearable,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: SelectProps) => {
  const reactId = useId();
  const buttonId = id ?? reactId;
  const listId = `${buttonId}-listbox`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeAheadRef = useRef<{ buffer: string; timer: number }>({ buffer: '', timer: 0 });

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value]
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        !buttonRef.current?.contains(event.target as Node) &&
        !listRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) {
      return;
    }
    const item = listRef.current.querySelector<HTMLLIElement>(
      `[data-option-index="${activeIndex}"]`
    );
    item?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const closeAndFocus = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const selectAt = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) {
      return;
    }
    onChange(option.value);
    closeAndFocus();
  };

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    setOpen((prev) => !prev);
  };

  const handleClear = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    onChange('');
  };

  const moveActive = (delta: number) => {
    if (options.length === 0) {
      return;
    }
    setActiveIndex((prev) => {
      const start = prev < 0 ? 0 : prev;
      let next = start;
      for (let i = 0; i < options.length; i += 1) {
        next = (next + delta + options.length) % options.length;
        if (!options[next].disabled) {
          return next;
        }
      }
      return prev;
    });
  };

  const runTypeAhead = (key: string) => {
    if (key.length !== 1) {
      return false;
    }
    const ta = typeAheadRef.current;
    ta.buffer += key.toLowerCase();
    window.clearTimeout(ta.timer);
    ta.timer = window.setTimeout(() => {
      ta.buffer = '';
    }, TYPE_AHEAD_TIMEOUT_MS);
    const idx = options.findIndex(
      (option) => !option.disabled && option.label.toLowerCase().startsWith(ta.buffer)
    );
    if (idx < 0) {
      return false;
    }
    if (open) {
      setActiveIndex(idx);
    } else {
      selectAt(idx);
    }
    return true;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    if (!open) {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        setOpen(true);
        return;
      }
    } else {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          moveActive(1);
          return;
        case 'ArrowUp':
          event.preventDefault();
          moveActive(-1);
          return;
        case 'Home':
          event.preventDefault();
          setActiveIndex(options.findIndex((option) => !option.disabled));
          return;
        case 'End':
          event.preventDefault();
          for (let i = options.length - 1; i >= 0; i -= 1) {
            if (!options[i].disabled) {
              setActiveIndex(i);
              break;
            }
          }
          return;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (activeIndex >= 0) {
            selectAt(activeIndex);
          }
          return;
        case 'Escape':
        case 'Tab':
          if (event.key === 'Escape') {
            event.preventDefault();
          }
          setOpen(false);
          return;
      }
    }
    runTypeAhead(event.key);
  };

  const showClear = isClearable && selectedOption && !disabled;

  return (
    <div className={cx(styles.root, disabled && styles['root--disabled'], className)}>
      <button
        ref={buttonRef}
        type="button"
        id={buttonId}
        className={styles.control}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${buttonId}-option-${activeIndex}` : undefined
        }
      >
        <span className={cx(styles.value, !selectedOption && styles['value--placeholder'])}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {showClear && (
          <span
            className={styles.clear}
            role="button"
            tabIndex={-1}
            aria-label="선택 해제"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
          >
            <X size={14} aria-hidden="true" />
          </span>
        )}
        <ChevronDown size={16} aria-hidden="true" className={styles.chevron} />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          className={styles.menu}
        >
          {options.map((option, idx) => (
            <li
              key={option.value}
              id={`${buttonId}-option-${idx}`}
              role="option"
              data-option-index={idx}
              aria-selected={selectedIndex === idx}
              aria-disabled={option.disabled || undefined}
              className={cx(
                styles.option,
                idx === activeIndex && styles['option--active'],
                selectedIndex === idx && styles['option--selected'],
                option.disabled && styles['option--disabled']
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => !option.disabled && selectAt(idx)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
