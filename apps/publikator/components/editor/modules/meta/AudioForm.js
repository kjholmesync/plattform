import { useEffect } from 'react'
import { Set, Map } from 'immutable'

import { Field, Dropdown } from '@project-r/styleguide'

import {
  MetaSection,
  MetaSectionTitle,
  MetaOption,
  MetaOptionLabel,
  MetaOptionGroup,
  MetaOptionGroupTitle,
} from '../../../MetaDataForm/components/Layout'
import MetaForm from '../../utils/MetaForm'
import ImageCrop from '../../utils/ImageCrop'
import withT from '../../../../lib/withT'

// @see GraphQL schema-types enum AudioSourceKind
const AUDIO_SOURCE_KINDS = [
  // 'podcast', // not in use (yet)
  'readAloud',
  // 'syntheticReadAloud', // not in use (yet)
]
export default withT(({ t, editor, node, onInputChange, format }) => {
  const audioCoverAnchors = [null, 'middle'].map((value) => ({
    value,
    text: t(`metaData/audio/cover/anchor/${value}`),
  }))
  const audioSourceKinds = [null, ...AUDIO_SOURCE_KINDS].map((value) => ({
    value,
    text: t(`metaData/audio/source/kind/${value}`),
  }))

  const onChange = (key) => (newValue) => {
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data:
          newValue !== null
            ? node.data.set(key, newValue)
            : node.data.remove(key),
      })
    })
  }

  const audioCover = node.data.get('audioCover')
  const audioSourceKind = node.data.get('audioSourceKind')

  const audioSourceKeys = Set(['audioSourceMp3', 'audioSourceAac'])
  const audioDefaultValues = Map(audioSourceKeys.map((key) => [key, '']))
  const audioSourceData = audioDefaultValues.merge(
    node.data.filter((_, key) => audioSourceKeys.has(key)),
  )

  const documentImage = node.data.get('image')

  useEffect(() => {
    if (documentImage) {
      onChange('audioSourceCoverImage')(documentImage)
    }
  }, [documentImage])

  return (
    <MetaSection>
      <MetaSectionTitle>{t('metaData/audio')}</MetaSectionTitle>
      <MetaOption>
        <MetaForm
          data={audioSourceData}
          onInputChange={onInputChange}
          getWidth={() => ''}
          black
        />
      </MetaOption>
      <MetaOption>
        <Dropdown
          black
          label={t('metaData/audio/source/kind')}
          items={audioSourceKinds}
          value={audioSourceKind || null}
          onChange={({ value }) => onChange('audioSourceKind')(value)}
        />
      </MetaOption>
      <MetaOptionGroupTitle>Play-Button auf Artikel-Bild</MetaOptionGroupTitle>
      <MetaOptionGroup>
        <MetaOption>
          <Dropdown
            black
            label='Position'
            items={audioCoverAnchors}
            value={audioCover ? audioCover.anchor : null}
            onChange={({ value }) =>
              onChange('audioCover')(
                value && {
                  anchor: value,
                  color: (audioCover && audioCover.color) || '#fff',
                  backgroundColor:
                    (audioCover && audioCover.backgroundColor) ||
                    'rgba(255,255,255,0.3)',
                },
              )
            }
          />
        </MetaOption>
        {audioCover && (
          <Field
            black
            label={t('metaData/audio/cover/color')}
            value={audioCover.color}
            onChange={(_, color) => {
              onChange('audioCover')({
                ...audioCover,
                color,
              })
            }}
          />
        )}
        {audioCover && (
          <MetaOption>
            <Field
              black
              label={t('metaData/audio/cover/backgroundColor')}
              value={audioCover.backgroundColor}
              onChange={(_, backgroundColor) => {
                onChange('audioCover')({
                  ...audioCover,
                  backgroundColor,
                })
              }}
            />
          </MetaOption>
        )}
      </MetaOptionGroup>
      <MetaOptionGroupTitle>Audio-Cover und Vorschau</MetaOptionGroupTitle>
      <MetaOption>
        <ImageCrop
          src={node.data.get('image')}
          onChange={onInputChange('imageAudioCoverCrop')}
          format={format}
        />
      </MetaOption>
    </MetaSection>
  )
})
