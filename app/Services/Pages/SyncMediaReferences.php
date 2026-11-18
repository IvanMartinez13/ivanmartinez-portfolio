<?php

namespace App\Services\Pages;

use App\Models\MediaAsset;
use App\Models\MediaAssetReference;
use App\Models\PortfolioPage;
use App\Models\PortfolioPageRevision;

class SyncMediaReferences
{
    /** @param array<mixed> $blocks */
    public function sync(PortfolioPage $page, string $scope, array $blocks, ?PortfolioPageRevision $revision = null): void
    {
        $query = MediaAssetReference::query()->where('portfolio_page_id', $page->id)->where('scope', $scope);
        if ($scope === 'revision') {
            $query->where('portfolio_page_revision_id', $revision?->id);
        }
        $query->delete();

        $ids = [];
        $this->collect($blocks, $ids);
        foreach (array_keys($ids) as $id) {
            MediaAssetReference::query()->create([
                'media_asset_id' => $id,
                'portfolio_page_id' => $page->id,
                'portfolio_page_revision_id' => $scope === 'revision' ? $revision?->id : null,
                'scope' => $scope,
            ]);
        }
    }

    /** @param array<mixed> $value @param array<int, true> $ids */
    private function collect(array $value, array &$ids): void
    {
        foreach ($value as $key => $item) {
            if ($key === 'asset_id' && (is_int($item) || (is_string($item) && ctype_digit($item)))) {
                $id = (int) $item;
                if (MediaAsset::query()->whereKey($id)->exists()) {
                    $ids[$id] = true;
                }
            } elseif (is_array($item)) {
                $this->collect($item, $ids);
            }
        }
    }
}
