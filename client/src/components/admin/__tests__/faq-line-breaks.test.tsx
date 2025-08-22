import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FaqTab from '../faq-tab';
import { AdvancedTextarea } from '@/components/ui/advanced-textarea';
import { FormattedText } from '@/components/ui/formatted-text';
import { CharacterCounter } from '@/components/ui/character-counter';

// Mock do QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Mock das APIs
const mockFaqItems = [
  {
    id: '1',
    question: 'Como funciona o plano?\n\nPreciso de documentos?',
    answer: 'O plano funciona assim:\n\n1. Cadastro\n2. Ativação\n3. Uso',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
  }
];

// Mock do fetch
global.fetch = jest.fn();

describe('FAQ Line Breaks Support', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    (fetch as jest.Mock).mockClear();
  });

  describe('AdvancedTextarea Component', () => {
    it('should preserve line breaks in input', () => {
      const mockOnChange = jest.fn();
      const textWithBreaks = 'Line 1\nLine 2\nLine 3';

      render(
        <AdvancedTextarea
          value={textWithBreaks}
          onChange={(e) => mockOnChange(e.target.value)}
          placeholder="Test placeholder"
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(textWithBreaks);
    });

    it('should show preview with line breaks preserved', () => {
      const textWithBreaks = 'Line 1\nLine 2\nLine 3';

      render(
        <AdvancedTextarea
          value={textWithBreaks}
          placeholder="Test placeholder"
        />
      );

      // Click preview button
      const previewButton = screen.getByText('Preview');
      fireEvent.click(previewButton);

      // Check if preview shows line breaks
      expect(screen.getByText('Line 1')).toBeInTheDocument();
      expect(screen.getByText('Line 2')).toBeInTheDocument();
      expect(screen.getByText('Line 3')).toBeInTheDocument();
    });

    it('should auto-resize based on content', async () => {
      const longText = 'Line 1\n'.repeat(10);

      render(
        <AdvancedTextarea
          value={longText}
          placeholder="Test placeholder"
        />
      );

      const textarea = screen.getByRole('textbox');
      const initialHeight = textarea.style.height;

      // Simulate content change
      fireEvent.input(textarea, { target: { value: longText + '\nNew line' } });

      await waitFor(() => {
        expect(textarea.style.height).not.toBe(initialHeight);
      });
    });
  });

  describe('FormattedText Component', () => {
    it('should render text with line breaks as <br> elements', () => {
      const textWithBreaks = 'Line 1\nLine 2\nLine 3';

      render(<FormattedText text={textWithBreaks} />);

      // Check if all lines are rendered
      expect(screen.getByText('Line 1')).toBeInTheDocument();
      expect(screen.getByText('Line 2')).toBeInTheDocument();
      expect(screen.getByText('Line 3')).toBeInTheDocument();
    });

    it('should handle empty text gracefully', () => {
      render(<FormattedText text="" />);
      expect(screen.getByText('Nenhum texto inserido')).toBeInTheDocument();
    });

    it('should handle text with multiple consecutive line breaks', () => {
      const textWithMultipleBreaks = 'Line 1\n\n\nLine 2';

      render(<FormattedText text={textWithMultipleBreaks} />);

      expect(screen.getByText('Line 1')).toBeInTheDocument();
      expect(screen.getByText('Line 2')).toBeInTheDocument();
    });
  });

  describe('CharacterCounter Component', () => {
    it('should count characters including line breaks', () => {
      const textWithBreaks = 'Line 1\nLine 2';
      const expectedLength = 12; // Including \n

      render(
        <CharacterCounter
          text={textWithBreaks}
          maxLength={100}
          showDetails={true}
        />
      );

      expect(screen.getByText(`${expectedLength}/100 caracteres`)).toBeInTheDocument();
    });

    it('should show line and word count', () => {
      const textWithBreaks = 'Line 1\nLine 2\nLine 3';

      render(
        <CharacterCounter
          text={textWithBreaks}
          maxLength={100}
          showDetails={true}
        />
      );

      expect(screen.getByText('3 linhas')).toBeInTheDocument();
      expect(screen.getByText('6 palavras')).toBeInTheDocument();
    });

    it('should show warning when approaching limit', () => {
      const longText = 'A'.repeat(90); // 90/100 characters

      render(
        <CharacterCounter
          text={longText}
          maxLength={100}
          showDetails={false}
        />
      );

      expect(screen.getByText('90/100 caracteres')).toBeInTheDocument();
    });

    it('should show error when exceeding limit', () => {
      const longText = 'A'.repeat(110); // 110/100 characters

      render(
        <CharacterCounter
          text={longText}
          maxLength={100}
          showDetails={false}
        />
      );

      expect(screen.getByText('110/100 caracteres')).toBeInTheDocument();
      expect(screen.getByText('+10 caracteres excedidos')).toBeInTheDocument();
    });
  });

  describe('FAQ Tab Integration', () => {
    it('should render FAQ items with preserved line breaks', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFaqItems,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <FaqTab />
        </QueryClientProvider>
      );

      // Wait for FAQ items to load
      await waitFor(() => {
        expect(screen.getByText('Como funciona o plano?')).toBeInTheDocument();
      });

      // Check if line breaks are preserved in the accordion
      const accordionTrigger = screen.getByText('Como funciona o plano?');
      fireEvent.click(accordionTrigger);

      // Check if answer shows with line breaks
      expect(screen.getByText('O plano funciona assim:')).toBeInTheDocument();
      expect(screen.getByText('1. Cadastro')).toBeInTheDocument();
      expect(screen.getByText('2. Ativação')).toBeInTheDocument();
      expect(screen.getByText('3. Uso')).toBeInTheDocument();
    });
  });
});

// Test utilities
export const createMockFaqItem = (overrides = {}) => ({
  id: '1',
  question: 'Test question',
  answer: 'Test answer',
  displayOrder: 1,
  isActive: true,
  createdAt: new Date(),
  ...overrides,
});

export const createTextWithBreaks = (lines: string[]) => lines.join('\n');
