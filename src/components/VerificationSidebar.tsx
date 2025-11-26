import type { VerificationResult } from '../services/verification'
import TweetChatbot from './TweetChatbot'

interface VerificationSidebarProps {
  result: VerificationResult | null
  isVisible: boolean
  onClose: () => void
  tweetContent?: string
  tweetId?: string
  imageUrl?: string
  chatId?: string | null
}

export default function VerificationSidebar({ result, isVisible, onClose, tweetContent = '', tweetId, imageUrl, chatId }: VerificationSidebarProps) {
  if (!isVisible || !result) return null

  const getSourceIconUrl = (link?: string) => {
    if (!link) return null
    try {
      const url = new URL(link)
      const domain = url.hostname
      // Use Google's favicon service for a clean, consistent icon
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
    } catch {
      return null
    }
  }

  const getVerdictInfo = (verdict: string | undefined) => {
    const lowerVerdict = String(verdict ?? '').toLowerCase()
    if (lowerVerdict.includes('true') || lowerVerdict.includes('accurate') || lowerVerdict.includes('real')) {
      return {
        color: '#10b981',
        bgColor: '#d1fae5',
        icon: '✅',
        title: 'Verified as True',
        subtitle: 'This information appears to be accurate',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      }
    } else if (lowerVerdict.includes('false') || lowerVerdict.includes('misinformation') || lowerVerdict.includes('fake')) {
      return {
        color: '#ef4444',
        bgColor: '#fee2e2',
        icon: '❌',
        title: 'Verified as False',
        subtitle: 'This information appears to be inaccurate',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      }
    } else {
      return {
        color: '#f59e0b',
        bgColor: '#fef3c7',
        icon: '⚠️',
        title: 'Uncertain',
        subtitle: 'Unable to verify this information',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      }
    }
  }

  const getConfidenceInfo = (confidence: number) => {
    if (confidence >= 0.8) {
      return {
        color: '#10b981',
        label: 'High Confidence',
        icon: '🎯'
      }
    } else if (confidence >= 0.6) {
      return {
        color: '#f59e0b',
        label: 'Medium Confidence',
        icon: '⚖️'
      }
    } else {
      return {
        color: '#ef4444',
        label: 'Low Confidence',
        icon: '❓'
      }
    }
  }

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`
  }

  const verdictInfo = getVerdictInfo(result.verdict)
  const confidenceInfo = getConfidenceInfo(result.confidence)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: 'min(560px, 92vw)',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border)',
      boxShadow: '-8px 0 30px rgba(0,0,0,.25)',
      zIndex: 9999,
      overflowY: 'auto',
      animation: 'slideInRight 0.28s ease'
    }}>
      {/* Header */}
      <div style={{
        background: verdictInfo.gradient,
        padding: '22px 24px',
        color: 'white',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
            width: 32,
            height: 32,
            borderRadius: 999,
            border: 'none',
            background: 'rgba(255,255,255,.22)',
            color: 'white',
            fontSize: 18,
            cursor: 'pointer'
          }}
        >
          ×
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>⭐</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.2 }}>RealityCheck Verification</div>
            <div style={{ opacity: .9, marginTop: 2 }}>AI-Powered Content Analysis</div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{verdictInfo.icon}</span>
          <div>
            <div style={{ fontWeight: 700 }}>{verdictInfo.title}</div>
            <div style={{ opacity: .9, fontSize: 14 }}>{verdictInfo.subtitle}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 24 }}>
        {/* Confidence card */}
        <section style={{
          background: confidenceInfo.color === '#10b981' ? '#e7fbf2' : confidenceInfo.color === '#f59e0b' ? '#fff6e6' : '#ffecec',
          border: `1px solid ${confidenceInfo.color}55`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{confidenceInfo.icon}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: confidenceInfo.color }}>{confidenceInfo.label}</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: confidenceInfo.color }}>{formatConfidence(result.confidence)}</span>
          </div>
          <div style={{ height: 10, background: `${confidenceInfo.color}22`, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              width: `${result.confidence * 100}%`,
              height: '100%',
              background: confidenceInfo.color,
              transition: 'width .6s ease'
            }} />
          </div>
        </section>

        {/* AI Analysis */}
        <section style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>🔍</span>
            <div style={{ fontWeight: 800 }}>AI Analysis</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {result.reason}
          </div>
        </section>

        {/* Cited sources / related coverage */}
        {Array.isArray(result.sources) && result.sources.length > 0 && (
          <section style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border)', 
            borderRadius: 16, 
            padding: 20, 
            marginBottom: 20,
            boxShadow: '0 10px 30px rgba(15,23,42,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>📰</span>
                <div>
                  <div style={{ fontWeight: 800 }}>Referenced News Coverage</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Articles consulted while verifying this post
                  </div>
                </div>
              </div>
              <span style={{ 
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                background: 'rgba(148,163,184,0.15)',
                color: 'var(--text-muted)'
              }}>
                {result.sources.length} {result.sources.length === 1 ? 'article' : 'articles'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {result.sources.map((source, index) => (
                <a
                  key={`${source.link || source.headline || index}-${index}`}
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    borderRadius: 999,
                    padding: '8px 14px',
                    background: 'radial-gradient(circle at 0% 0%, rgba(248,250,252,0.9), rgba(148,163,184,0.18))',
                    border: '1px solid rgba(148,163,184,0.6)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease',
                    maxWidth: '100%'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
                    ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 24px rgba(15,23,42,0.28)'
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(59,130,246,0.85)'
                    ;(e.currentTarget as HTMLAnchorElement).style.background = 'radial-gradient(circle at 0% 0%, rgba(248,250,252,1), rgba(56,189,248,0.25))'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
                    ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(148,163,184,0.45)'
                    ;(e.currentTarget as HTMLAnchorElement).style.background = 'radial-gradient(circle at 0% 0%, rgba(248,250,252,0.9), rgba(148,163,184,0.18))'
                  }}
                  title={source.headline || source.publication || 'Referenced article'}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '999px',
                      background: 'conic-gradient(from 180deg at 50% 50%, #3b82f6, #0ea5e9, #6366f1, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 1px rgba(15,23,42,0.48)'
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '999px',
                        background: 'radial-gradient(circle at 30% 20%, #ffffff, #e5e7eb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      {getSourceIconUrl(source.link) ? (
                        <>
                          <img
                            src={getSourceIconUrl(source.link) || ''}
                            alt={source.publication || 'News source'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            onError={(e) => {
                              // Hide the broken image; the initial chip will be shown instead
                              e.currentTarget.style.display = 'none'
                              const fallback = e.currentTarget.nextSibling as HTMLElement | null
                              if (fallback) {
                                fallback.style.display = 'flex'
                              }
                            }}
                          />
                          <span
                            style={{
                              display: 'none',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#1f2937'
                            }}
                          >
                            {(source.publication || 'N')[0]?.toUpperCase()}
                          </span>
                        </>
                      ) : (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#1f2937'
                          }}
                        >
                          {(source.publication || 'N')[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: 0.7,
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      maxWidth: 170
                    }}
                  >
                    {source.publication || 'News source'}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Why this matters */}
        {result.awareness_factor && (
          <section style={{ background: '#fff6e0', border: '1px solid #f59e0b55', borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <div style={{ fontWeight: 800, color: '#b45309' }}>Why This Matters</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.6)', borderRadius: 12, padding: 16, color: '#7c2d12', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {result.awareness_factor}
            </div>
          </section>
        )}

        {/* Chatbot (optional) */}
        {tweetContent && (
          <section style={{ marginTop: 16 }}>
            <TweetChatbot
              tweetContent={tweetContent}
              verificationResult={result}
              tweetId={tweetId}
              imageUrl={imageUrl}
              chatId={chatId}
            />
          </section>
        )}

        {/* Footer */}
        <footer style={{ marginTop: 20, borderTop: '1px dashed var(--border)', paddingTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          This analysis is generated by AI and should be used as a reference only. Verify with trusted sources.
        </footer>
      </div>

      <style>{`
        @keyframes slideInRight { from { opacity: 0; transform: translateX(12%);} to { opacity: 1; transform: translateX(0);} }
      `}</style>
    </div>
  )
}

