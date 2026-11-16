<?php

namespace App\Services\Pages;

use DOMDocument;
use DOMElement;
use DOMNode;

class SafeRichText
{
    public function sanitize(string $html): string
    {
        $document = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="UTF-8"><div id="safe-root">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        $root = $document->getElementById('safe-root');
        if (! $root) {
            return '';
        }
        $this->clean($root);

        $result = '';
        foreach ($root->childNodes as $child) {
            $result .= $document->saveHTML($child);
        }

        return $result;
    }

    private function clean(DOMNode $node): void
    {
        $allowed = ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'blockquote'];
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof DOMElement && ! in_array(strtolower($child->tagName), $allowed, true)) {
                $node->removeChild($child);

                continue;
            }
            if ($child instanceof DOMElement) {
                $safeHref = null;
                if (strtolower($child->tagName) === 'a') {
                    $href = $child->getAttribute('href');
                    if (! str_starts_with($href, '/') && (! filter_var($href, FILTER_VALIDATE_URL) || parse_url($href, PHP_URL_SCHEME) !== 'https')) {
                        $safeHref = null;
                    } else {
                        $safeHref = $href;
                    }
                }
                while ($child->attributes?->length) {
                    $child->removeAttributeNode($child->attributes->item(0));
                }
                if ($safeHref !== null) {
                    $child->setAttribute('href', $safeHref);
                    $child->setAttribute('rel', 'noopener noreferrer');
                }
                $this->clean($child);
            }
        }
    }
}
