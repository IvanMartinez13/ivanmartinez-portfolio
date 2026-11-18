<?php

namespace App\Support;

class PublicLocation
{
    public static function cityAndRegion(mixed $location): ?string
    {
        if (! is_string($location) || trim($location) === '') {
            return null;
        }

        $location = trim($location);
        $parts = preg_split('/\s*[,;]\s*/u', $location, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $streetPattern = '/(?:\b(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|drive|dr\.?|carrer|calle|avenida|avinguda|passeig|plaza|plaça|camí|carretera)\b|\bc\/)/iu';

        foreach ($parts as $index => $part) {
            if (preg_match($streetPattern, $part)) {
                $parts = array_slice($parts, $index + 1);
                break;
            }
        }

        $localities = array_values(array_filter(array_map(
            fn (string $part): string => trim((string) preg_replace('/\b\d{4,6}\b/u', '', $part)),
            $parts,
        ), fn (string $part): bool => $part !== '' && ! preg_match('/^\d+[a-z]?$/iu', $part)));

        return $localities === [] ? null : implode(', ', array_slice($localities, 0, 2));
    }
}
