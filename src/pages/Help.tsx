import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { HelpCircle, Youtube, FileText } from 'lucide-react';

export const Help: React.FC = () => {
  const { helpContent, loading } = useApp();

  const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
      }
      if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
    } catch (error) {
      console.error("Invalid URL for YouTube video:", error);
      return null;
    }
    return null;
  };

  const embedUrl = getYouTubeEmbedUrl(helpContent?.help_video_url);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-white/50 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-text-secondary">Carregando conteúdo de ajuda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white flex items-center justify-center"
        >
          <HelpCircle className="w-10 h-10 mr-4 text-blue-400" />
          Página de Ajuda
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-text-secondary text-lg mt-2"
        >
          Encontre aqui instruções e tutoriais para usar o sistema.
        </motion.p>
      </header>

      <div className="space-y-12">
        {/* Help Text Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-form-bg border border-border-dark rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-400" />
            Instruções
          </h2>
          {helpContent?.help_text ? (
            <div className="prose prose-invert max-w-none text-text-secondary whitespace-pre-wrap">
              {helpContent.help_text}
            </div>
          ) : (
            <p className="text-text-secondary">Nenhuma instrução foi adicionada ainda. O administrador pode adicionar um texto de ajuda no painel de controle.</p>
          )}
        </motion.div>

        {/* YouTube Video Section */}
        {embedUrl && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-form-bg border border-border-dark rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Youtube className="w-6 h-6 mr-3 text-red-500" />
              Vídeo Tutorial
            </h2>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <iframe
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
