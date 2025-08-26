<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250825125612 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE carnet_vol ADD type_de_vol_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE carnet_vol DROP type_vol');
        $this->addSql('ALTER TABLE carnet_vol ADD CONSTRAINT FK_96A66A5C303FE84E FOREIGN KEY (type_de_vol_id) REFERENCES nature (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_96A66A5C303FE84E ON carnet_vol (type_de_vol_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE carnet_vol DROP CONSTRAINT FK_96A66A5C303FE84E');
        $this->addSql('DROP INDEX IDX_96A66A5C303FE84E');
        $this->addSql('ALTER TABLE carnet_vol ADD type_vol VARCHAR(50) NOT NULL');
        $this->addSql('ALTER TABLE carnet_vol DROP type_de_vol_id');
    }
}
