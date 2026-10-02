UPDATE site_content
SET
  value = '{"href":"/api/media/epk-pdf/RIVKALA_EPK_OFFICIAL.pdf","downloadName":"RIVKALA EPK OFFICIAL.pdf"}',
  updated_at = '2026-07-02T00:00:00.000Z'
WHERE key = 'epk_pdf'
  AND value LIKE '%RIVKALA%20EPK%20OFFICIAL.pdf%';
